
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageBase64, description, userId } = await req.json();
    
    console.log('Generating clothing try-on for user:', userId);

    // Check if user has a personalized avatar
    const { data: avatarData, error: avatarError } = await supabase
      .from('personalized_avatars')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

    if (avatarError || !avatarData) {
      throw new Error('Please create your personalized avatar first before uploading clothing items.');
    }

    // First, analyze the clothing image with GPT-4 Vision to get detailed description
    console.log('Analyzing clothing image with GPT-4 Vision...');
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this clothing item image in extreme detail. Describe the exact clothing item, including: type of garment, color, pattern, texture, style, fit, any logos or text, decorative elements, fabric appearance, and any unique features. Be very specific and detailed as this description will be used to recreate the exact same clothing item on an avatar.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!visionResponse.ok) {
      const visionError = await visionResponse.text();
      console.error('GPT-4 Vision API error:', visionError);
      throw new Error(`Vision analysis failed: ${visionResponse.status} - ${visionError}`);
    }

    const visionData = await visionResponse.json();
    const detailedClothingDescription = visionData.choices[0].message.content;
    
    console.log('Clothing analysis complete:', detailedClothingDescription);

    // Generate clothing try-on using the user's personalized avatar
    console.log('Generating clothing try-on with DALL-E 3...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a single 2D fashion avatar that looks exactly like the person in this reference image: ${avatarData.avatar_url}, but wearing this exact clothing item: ${detailedClothingDescription}. The avatar should maintain the same person's appearance, facial features, hair, and body type from the reference image, but now wearing the described clothing item. Style: professional fashion photography, clean white background, good lighting. The person should be wearing the EXACT same clothing item as described while maintaining their unique appearance. Make sure it's only one person in the image.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.data[0].url;
    
    console.log('Avatar generated successfully');

    // Download the generated image
    const imageResponse = await fetch(generatedImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageFile = new Uint8Array(imageBuffer);

    // Upload to Supabase storage
    const fileName = `${userId}/${crypto.randomUUID()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wardrobes')
      .upload(fileName, imageFile, {
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('wardrobes')
      .getPublicUrl(fileName);

    // Save to database with avatar reference
    const { data: dbData, error: dbError } = await supabase
      .from('wardrobes')
      .insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        description: description || 'AI-generated avatar wearing uploaded item',
        avatar_id: avatarData.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw dbError;
    }

    console.log('Avatar saved to wardrobe successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      wardrobeItem: dbData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-avatar function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate avatar' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

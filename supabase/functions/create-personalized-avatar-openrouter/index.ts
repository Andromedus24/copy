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
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY') || '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';
    const siteUrl = Deno.env.get('SITE_URL') || 'https://fitzty.com';
    const siteName = Deno.env.get('SITE_NAME') || 'Fitzty';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageBase64, userId } = await req.json();
    
    console.log('Creating personalized avatar for user:', userId);

    // First, analyze the user's photo with OpenRouter Vision API
    console.log('Analyzing user photo with OpenRouter Vision...');
    const visionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwq-32b:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this person\'s photo in extreme detail. Describe their appearance including: gender, age range, hair color and style, eye color, skin tone, facial features, body type, and any distinctive characteristics. Be very specific and detailed as this description will be used to create a personalized avatar that looks like this person.'
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
      console.error('OpenRouter Vision API error:', visionError);
      throw new Error(`Vision analysis failed: ${visionResponse.status} - ${visionError}`);
    }

    const visionData = await visionResponse.json();
    const personDescription = visionData.choices[0].message.content;
    
    console.log('Person analysis complete:', personDescription);

    // Generate personalized avatar using OpenRouter DALL-E 3 equivalent
    console.log('Generating personalized avatar with OpenRouter...');
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a single 2D fashion avatar of a person that looks exactly like this description: ${personDescription}. The avatar should be a modern, attractive person in a clean studio setting with a neutral pose, showcasing fashion potential. Style: professional fashion photography, clean white background, good lighting, high quality. The person should look exactly like the described person. Make sure it's only one person in the image.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const generatedAvatarUrl = data.data[0].url;
    
    console.log('Personalized avatar generated successfully');

    // Download the generated avatar
    const avatarResponse = await fetch(generatedAvatarUrl);
    if (!avatarResponse.ok) {
      throw new Error('Failed to download generated avatar');
    }
    
    const avatarBuffer = await avatarResponse.arrayBuffer();
    const avatarFile = new Uint8Array(avatarBuffer);

    // Upload original photo to storage
    const originalPhotoFileName = `${userId}/original_${crypto.randomUUID()}.jpg`;
    const { error: originalPhotoError } = await supabase.storage
      .from('original-photos')
      .upload(originalPhotoFileName, new Uint8Array(Buffer.from(imageBase64, 'base64')), {
        contentType: 'image/jpeg'
      });

    if (originalPhotoError) {
      console.error('Original photo upload error:', originalPhotoError);
      throw originalPhotoError;
    }

    // Get original photo URL
    const { data: originalPhotoUrlData } = supabase.storage
      .from('original-photos')
      .getPublicUrl(originalPhotoFileName);

    // Upload avatar to storage
    const avatarFileName = `${userId}/avatar_${crypto.randomUUID()}.png`;
    const { error: avatarUploadError } = await supabase.storage
      .from('wardrobes')
      .upload(avatarFileName, avatarFile, {
        contentType: 'image/png'
      });

    if (avatarUploadError) {
      console.error('Avatar upload error:', avatarUploadError);
      throw avatarUploadError;
    }

    // Get avatar URL
    const { data: avatarUrlData } = supabase.storage
      .from('wardrobes')
      .getPublicUrl(avatarFileName);

    // Save to personalized_avatars table
    const { data: avatarData, error: avatarDbError } = await supabase
      .from('personalized_avatars')
      .upsert({
        user_id: userId,
        original_photo_url: originalPhotoUrlData.publicUrl,
        avatar_url: avatarUrlData.publicUrl
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (avatarDbError) {
      console.error('Database insert error:', avatarDbError);
      throw avatarDbError;
    }

    console.log('Personalized avatar saved successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      avatar: avatarData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-personalized-avatar-openrouter function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create personalized avatar' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 
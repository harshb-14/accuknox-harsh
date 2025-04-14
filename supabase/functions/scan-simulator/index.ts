import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all images that are in scanning status
    const { data: scanningImages, error: fetchError } = await supabase
      .from('container_images')
      .select('*')
      .eq('status', 'scanning');

    if (fetchError) throw fetchError;

    for (const image of scanningImages || []) {
      // Simulate finding vulnerabilities
      const criticalCount = Math.floor(Math.random() * 5);
      const highCount = Math.floor(Math.random() * 8);
      const mediumCount = Math.floor(Math.random() * 15);

      // Update the image with scan results
      const { error: updateError } = await supabase
        .from('container_images')
        .update({
          status: 'complete',
          critical_vulnerabilities: criticalCount,
          high_vulnerabilities: highCount,
          medium_vulnerabilities: mediumCount,
          last_scan: new Date().toISOString(),
        })
        .eq('id', image.id);

      if (updateError) throw updateError;

      // Update scan history
      const { error: historyError } = await supabase
        .from('scan_history')
        .update({
          status: 'complete',
          scan_completed_at: new Date().toISOString(),
          vulnerabilities_found: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
          },
        })
        .eq('image_id', image.id)
        .eq('status', 'scanning');

      if (historyError) throw historyError;
    }

    return new Response(
      JSON.stringify({ message: 'Scan simulation completed' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
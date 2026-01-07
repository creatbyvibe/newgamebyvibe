import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, creationId, saveSlot, saveData, saveName } = await req.json();

    switch (action) {
      case "save": {
        // Upsert save data
        const { data, error } = await supabase
          .from("game_saves")
          .upsert({
            user_id: user.id,
            creation_id: creationId,
            save_slot: saveSlot || 1,
            save_data: saveData,
            save_name: saveName || `Save ${saveSlot || 1}`,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,creation_id,save_slot",
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, save: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "load": {
        // Load save data
        const { data, error } = await supabase
          .from("game_saves")
          .select("*")
          .eq("user_id", user.id)
          .eq("creation_id", creationId)
          .eq("save_slot", saveSlot || 1)
          .maybeSingle();

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, save: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        // List all saves for a creation
        const { data, error } = await supabase
          .from("game_saves")
          .select("*")
          .eq("user_id", user.id)
          .eq("creation_id", creationId)
          .order("save_slot");

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, saves: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        const { error } = await supabase
          .from("game_saves")
          .delete()
          .eq("user_id", user.id)
          .eq("creation_id", creationId)
          .eq("save_slot", saveSlot || 1);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("game-save error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

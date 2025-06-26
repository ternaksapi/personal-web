import { supabase } from '$lib/supabase.js'

export async function load() {
    const { data: reads, error } = await supabase
        .from('reads')
        .select('*')
        .order('date_added', { ascending: false })

    if (error) {
        console.error('Error fetching reads:', error)
        return {
            reads: []
        }
    }

    return {
        reads: reads || []
    }
}
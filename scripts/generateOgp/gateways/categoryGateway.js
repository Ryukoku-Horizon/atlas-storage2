import "dotenv/config"

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

const getCategory=async(select,match)=>{
    const res = await fetch(`${SUPABASE_URL}/functions/v1/getCategory`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body:JSON.stringify({
            match,
            select
        })
    })
    const data = await res.json();
    return data;
}

export const getAllCategory=async()=>{
    const data = await getCategory("*")
    return data;
}
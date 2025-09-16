import "dotenv/config"

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export const getAll=async()=>{
    try{
        const res = await fetch(`${SUPABASE_URL}/functions/v1/getCurriculumWithSelect`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            },
            body:JSON.stringify({
                select: "*"
            })
        });
        const result = await res.json();
        return result;
    }catch(e){
        console.error("error",e)
    }
}
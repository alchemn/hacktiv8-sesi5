import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})

const GEMINI_MODEL = 'gemini-2.0-flash'

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'/public')))


const PORT = 9000

app.listen(PORT,() => console.log(`Server running on port ${PORT}`))

app.post("/api/chat",async(req,res) => {
    const {conversation} = req.body

    try {
        if (!Array.isArray(conversation)) throw new Error("Conversation must be an array!")

            const filteredConversation = conversation.filter(item => item.text && item.text.trim() !== '');

            const contents = filteredConversation.map(({role,text}) => ({
                role,
                parts: [{text}]
            }));

            const response = await ai.models.generateContent({
                model:GEMINI_MODEL,
                contents
            })
            res.status(200).json({result:response.text})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})
"use client"
import Link from "next/link";
import {  useEffect, useState } from "react";
import OpenAI from 'openai';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";


export default function Grammar() {

    const separator = ["\n", ".", "?", "!", ". ", "? ", "! "]

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const [formState, setFormState] = useState({
        question: "",
        prompt: "",
        answer: "...."
    });

  
    const chatLogs: CreateChatCompletionRequestMessage[] = [] 

   

    useEffect(() => {
    
    }, []);


    const generateQuestion = async () => {
        const command = "Generate one sample question that are simillar from IELTS english test in speaking section";

        
    }

    const submitHandler = async () => {
        const command = "Please check the aspects of fluency and coherence, lexical resource, grammatical range and accuracy, pronountiation simillar like IELTS speaking test then give it score on each of them using percentaged and point out the wrong or error point in the text. It must returns an json contains 3 object which are an object with key scores it contains score each of four aspects in number and an object with key correct_text it contains only the correct version text with no explanation about the aspects";

        try {
            chatLogs.push({ role: "user", content: formState.prompt + command});

            const stream = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-16k-0613',
                messages: chatLogs,
                stream: true,
            });
            let tempData = "";
            let tempLine = "";
            const lineText = [];
            
            for await (const part of stream) {
                tempData += part.choices[0]?.delta.content ?? "";
                tempLine += part.choices[0]?.delta.content?.replace(/\n/g, '') ?? "";
                if (separator.some((val) => tempLine.includes(val))) {
                    const tempSplit = tempLine.split(".");
                    if (tempSplit.length > 1) {
                        tempSplit[0] += ".";
                    }
                    lineText.push(tempSplit[0].trimStart());
                    tempLine = tempSplit[1] ?? "";
                    tempData += "\n";
                }
                setFormState({ ...formState, answer: tempData });
            }
          
            
            chatLogs.push({ role: "assistant", content: tempData });
            
        } catch (err) {
            console.log(err);
        }
    };

    const resetHandler = () => {
        setFormState({
            ...formState,
            prompt: "",
            answer: "...",
        });
    };

    return (
        <div className="text-black flex justify-center">
            <div className="my-12 w-[1000px]">
                <form className="flex flex-col gap-6">
                    {/* <div className="flex flex-col gap-3 flex-1">
                                <label htmlFor="prompt" className="text-black">Question</label>
                                <textarea
                                    className="mt-1 block w-full p-2 resize-y bg-slate-200"
                                    name="question"
                                    id="question"
                                    value={formState.question}
                                />
                    </div> */}
                    <div className="w-100 flex gap-3">
                        <div className="flex flex-col gap-3 flex-1">
                            <label htmlFor="prompt" className="text-black">Prompt</label>
                            <textarea
                                className="mt-1 block w-full p-2 resize-y min-h-[300px] bg-slate-200"
                                name="prompt"
                                id="prompt"
                                placeholder="Fill this with english text...."
                                value={formState.prompt}
                                onChange={(e) => setFormState({ ...formState, prompt: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-3 flex-1">
                            <label htmlFor="prompt" className="text-black">Results</label>
                                <textarea
                                    className="mt-1 block w-full p-2 resize-y h-full bg-slate-200"
                                    name="answer"
                                    id="answer"
                                    disabled
                                    value={formState.answer}
                                />
                        </div>
                    </div>
                </form>

                <div className="flex justify-center">
                    <div className="flex justify-center flex-1">
                        <button
                            onClick={resetHandler}
                            className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 px-5 rounded-lg text-md font-semibold m-5 mt-10 w-1/2">
                            RESET
                        </button>
                    </div>
                    <div className="flex justify-center flex-1">
                        <button
                            onClick={submitHandler}
                            className="bg-blue-500 text-white text-center hover:bg-yellow-600 py-3 w-1/2 rounded-lg text-md font-semibold m-5 mt-10"
                        >
                            CHECK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

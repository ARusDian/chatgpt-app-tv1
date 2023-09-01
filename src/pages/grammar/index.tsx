"use client"
import Link from "next/link";
import {  useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import OpenAI from 'openai';
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";


export default function keren() {

    const separator = ["\n", ".", "?", "!", ". ", "? ", "! "]

    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
    });

    const [formState, setFormState] = useState({
        prompt: "",
        answer: "Results....",
        options: [],
    });

    const [isAsking, setIsAsking] = useState(false);

    const chatLogs: CreateChatCompletionRequestMessage[] = [] 

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setFormState({ ...formState, prompt: transcript });
        }
    }, [transcript]);

    const submitHandler = async () => {
        const command = "Please check the grammar correction and the vocabulary!"
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
                // console.log(part.choices[0]?.delta.content);
                tempData += part.choices[0]?.delta.content ?? "";
                tempLine += part.choices[0]?.delta.content ?? "";
                if (separator.some((val) => tempLine.includes(val))) {
                    const tempSplit = tempLine.split(".");
                    if (tempSplit.length > 1) {
                        tempSplit[0] += ".";
                    }
                    lineText.push(tempSplit[0].trimStart());
                    tempLine = tempSplit[1] ?? "";
                    tempData += "\n";
                }
                console.log(tempLine);
                setFormState({ ...formState, answer: tempData });
            }
          
            console.log(lineText);
            chatLogs.push({ role: "assistant", content: tempData });

            
        } catch (err) {
            console.log(err);
        }


    };
    

    const resetHandler = () => {
        resetTranscript();
        setFormState({
            ...formState,
            prompt: "",
            answer: "Results...",
        });
    };

    return (
        <div className="text-black flex justify-center bg-red">
            <div className="my-12 w-3/5">
                <form className="flex flex-col gap-5">
                    <div className="flex gap-3">
                        <label htmlFor="prompt" className="text-white">Prompt</label>
                        <textarea
                            className="mt-1 block w-full p-2 resize-y"
                            name="prompt"
                            id="prompt"
                            value={formState.prompt}
                            onChange={(e) => setFormState({ ...formState, prompt: e.target.value })}
                        />
                    </div>
                    {!isAsking ? (
                        <div className="flex gap-3">
                            <label htmlFor="prompt" className="text-white ">Results</label>
                            <textarea
                                className="mt-1 block w-full p-2 resize-y h-full bg-white"
                                name="answer"
                                id="answer"
                                disabled
                                value={formState.answer}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-white text-lg">
                            Loading....
                        </div>
                    )}
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
                            GRAMMAR CHECK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

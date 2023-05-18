"use client"
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: "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",
});

export default function keren() {
    const openai = new OpenAIApi(configuration);

    const [formState, setFormState] = useState({
        prompt: "",
        answer: "",
        options: [],
    });

    const [chatState, setChatState] = useState({
        messages: [],
    });

    const submitHandler = async () => {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: chatState.messages,
        });

        setChatState({
            // @ts-ignore
            messages: [...chatState.messages, { role: "user", content: formState.prompt }, { role: "assitant", content: response.data.choices[0].text }],
        });

        resetTranscript();
    };

    useEffect(() => {
        setFormState({ ...formState, answer: chatState.messages[chatState.messages.length - 1] });
    }, [chatState]);
  

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

    console.log(transcript);

    return (
        <div className="text-black flex justify-center bg-black">
            <div className="my-12 w-3/5">
                <form className="flex flex-col gap-5">
                    <div className="flex gap-3">
                        <label htmlFor="prompt" className="text-white">Prompt</label>
                        <input
                            className="mt-1 block w-full p-2"
                            type="text"
                            name="prompt"
                            id="prompt"
                            value={formState.prompt}
                            onChange={(e) => setFormState({ ...formState, prompt: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3">
                        <label htmlFor="prompt" className="text-white">Answer</label>
                        <input
                            className="mt-1 block w-full p-2"
                            type="text"
                            name="answer"
                            id="answer"
                            disabled
                            value={formState.answer}
                        />
                    </div>
                </form>
                <div className="flex justify-center mt-5">
                    <button
                        onClick={submitHandler}
                        className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 px-5 rounded-lg text-md font-semibold m-5 mt-10 w-1/2">
                        Submit
                    </button>
                </div>
                <p className="text-white">Microphone: {listening ? 'on' : 'off'}</p>
                <div className="flex flex-col lg:flex-row justify-center mt-5">
                    <button
                        className="bg-blue-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={() => SpeechRecognition.startListening({ language: "en-US" })}>Start</button>
                    <button
                        className="bg-red-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={SpeechRecognition.stopListening}>Stop</button>
                    <button
                        className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 w-full rounded-lg text-md font-semibold m-5 mt-10"
                        onClick={resetTranscript}>Reset</button>
                    <p>{transcript}</p>
                </div>
                <div>
                    {browserSupportsSpeechRecognition && (

                        browserSupportsSpeechRecognition

                    )}
                </div>
                <div 
                    className="flex justify-center"
                >
                    <Link
                        className="bg-blue-500 text-white text-center hover:bg-yellow-600 py-3 w-1/2 rounded-lg text-md font-semibold m-5 mt-10"
                        href={"/"}
                    >
                        Awal
                    </Link>
                </div>
            </div>
        </div>
    )
}

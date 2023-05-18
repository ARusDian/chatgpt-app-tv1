"use client"
import { MouseEventHandler, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Layout from "./keren/layout";
import Link from "next/link";

export default function index() {
  const [formState, setFormState] = useState({
    prompt: "",
    answer: "",
    options: [],
  });

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
    <Layout>
      <div className="text-black flex justify-center ">
        <div className="my-12 w-3/5">
          <form className="flex flex-col gap-5">
            <div className="flex gap-3">
              <label htmlFor="prompt">Prompt</label>
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
              <label htmlFor="prompt">Answer</label>
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
            
            <button className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 px-5 rounded-lg text-md font-semibold m-5 mt-10 w-1/2">
              Submit
            </button>
          </div>
          <p>Microphone: {listening ? 'on' : 'off'}</p>
          <div className="flex justify-center mt-5">
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
              href={"/keren"}
            >
              Keren
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

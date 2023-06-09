"use client"
import { useEffect, useState } from "react";
import { ChatGPTUnofficialProxyAPI } from "chatgpt";

export default function keren() {
    const api = new ChatGPTUnofficialProxyAPI({
        accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhcnVzaGR5bmVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItREdSTXhOTTdQMVFGd0I2RUJQTzRWSUdzIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2NDY2OWFkMmU0MDc4ZGNhZGU4ZWIxZjMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjg1ODg0NDAxLCJleHAiOjE2ODcwOTQwMDEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb3JnYW5pemF0aW9uLndyaXRlIn0.Jm7wZacCmsBhRL62I4kb_H-v_-v7RGLlW1uYenRtiSVWNCJyp6jlOI-g0b0eLdpEMf649uhDGxyw4SKF8p6H9St3oE452Bq5ST1qe9Pu1YVfdMjU_yvHzgEccHfYuJoEji_ie05rsh7_yQfsQvnaeJuXHgXT5DUeLtywVeTdjwnmC4CwqjXtjUK23i7nlxaq0qQu0KdJv4x6Zt5Z9wH4DC9-4Hl-D09v-T9g1dh44AGVW3919HaEtN8iORe_c_xRkxd7qHh-96eKr8oU7vBnP1apUHfdj4KHzJSg9ouucRpVusWVpGLfK9SWp3jI9iS6DrS2wF4VyWkMbZz8tYQFDA",
        apiReverseProxyUrl: "https://gpt.pawan.krd/backend-api/conversation",
        // apiReverseProxyUrl: "https://ai.fakeopen.com/api/conversation",
    })
    const [formState, setFormState] = useState({
        case: "Pada perusahaan yang bergerak pada bidang Minyak dan Gas membutuhkan karyawan baru untuk mengisi jabatan sebagai pekerja tambang",
        basicPrompt:
            `{self.case}.
Buatlah soal {self.type} untuk topik {self.topic} yang terdiri dari {self.num_questions} pertanyaan.
Setiap pertanyaan memiliki {self.num_possible_answers} kemungkinan jawaban.
Sertakan jawaban yang paling benar dengan tingkat kepercayaan 100% untuk setiap pertanyaan dengan menuliskan string 'Jawaban Benar:`,
        topic: "",
        type: "psikotes",
        num_questions: 0,
        num_possible_answers: 0,
        answer: "Ask me anything!",
        options: [],
        finalPrompt: "",
    });

    const [isAsking, setIsAsking] = useState(false);

    useEffect(() => {
        setFormState({ ...formState, finalPrompt: formState.basicPrompt.replace("{self.case}", formState.case).replace("{self.type}", formState.type).replace("{self.topic}", formState.topic).replace("{self.num_questions}", formState.num_questions.toString()).replace("{self.num_possible_answers}", formState.num_possible_answers.toString()) });
        console.log(formState.finalPrompt);
    }, [formState.case, formState.type, formState.topic, formState.num_questions, formState.num_possible_answers]);

    const submitHandler = async () => {
        setIsAsking(true);
        const response = await api.sendMessage(formState.finalPrompt).then((res) => {
            console.log(res);
            setFormState({
                ...formState,
                answer: res.text
            });
        }).catch(err => {
            console.log({ err })
        });
        setIsAsking(false);
    };

    const resetHandler = () => {
        setFormState({
            ...formState,
            basicPrompt: "",
            answer: "Ask me anything!",
        });
    };

    return (
        <div className="text-black flex justify-center bg-black">
            <div className="my-12 w-3/5">
                <form className="flex flex-col gap-5">
                    <div className="grid grid-cols-5 gap-3">
                        <label htmlFor="prompt" className="text-white col-span-1">Prompt Awal</label>
                        <textarea
                            className="mt-1 block w-full p-2 resize-y col-span-4 h-40"
                            name="prompt"
                            id="prompt"
                            value={formState.basicPrompt}
                            onChange={(e) => setFormState({ ...formState, basicPrompt: e.target.value })}
                        />
                        <label htmlFor="prompt" className="text-white col-span-1">Kasus</label>
                        <textarea
                            className="mt-1 block w-full p-2 resize-y col-span-4 h-32"
                            name="prompt"
                            id="prompt"
                            value={formState.case}
                            onChange={(e) => setFormState({ ...formState, case: e.target.value })}
                        />
                        <label htmlFor="prompt" className="text-white col-span-1">Jenis Soal</label>
                        <input
                            className="mt-1 block w-full p-2 resize-y col-span-4"
                            name="prompt"
                            id="prompt"
                            value={formState.type}
                            onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                        />
                        <label htmlFor="prompt" className="text-white col-span-1 ">Topik</label>
                        <input
                            className="mt-1 block w-full p-2 resize-y col-span-4"
                            name="prompt"
                            id="prompt"
                            value={formState.topic}
                            onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                        />

                        <label htmlFor="prompt" className="text-white col-span-1">Jumlah Pertanyaan</label>
                        <input
                            className="mt-1 block w-full p-2 resize-y col-span-4"
                            name="prompt"
                            id="prompt"
                            value={formState.num_questions}
                            type="number"
                            onChange={(e) => setFormState({ ...formState, num_questions: parseInt(e.target.value) })}
                        />

                        <label htmlFor="prompt" className="text-white col-span-1">Jumlah Jawaban</label>
                        <input
                            className="mt-1 block w-full p-2 resize-y col-span-4"
                            name="prompt"
                            id="prompt"
                            value={formState.num_possible_answers}
                            type="number"
                            onChange={(e) => setFormState({ ...formState, num_possible_answers: parseInt(e.target.value) })}
                        />
                        <label htmlFor="prompt" className="text-white col-span-1"> Pertanyaan Final</label>
                        <textarea
                            className="mt-1 block w-full p-2 resize-y col-span-4 h-60 bg-white"
                            name="prompt"
                            id="prompt"
                            disabled
                            value={formState.finalPrompt}
                            onChange={(e) => setFormState({ ...formState, case: e.target.value })}
                        />
                    </div>
                    {!isAsking ? (
                        <div className="flex gap-3">
                            <label htmlFor="prompt" className="text-white ">Answer</label>
                            <textarea
                                className="mt-1 block w-full p-2 resize-y bg-white"
                                name="answer"
                                id="answer"
                                disabled
                                value={formState.answer}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-white text-lg">
                            Generating....
                        </div>
                    )}
                </form>
                <div className="flex justify-center mt-5">
                    <button
                        onClick={submitHandler}
                        className="bg-yellow-500 text-white hover:bg-yellow-600 py-3 px-5 rounded-lg text-md font-semibold m-5 mt-10 w-1/2">
                        Submit
                    </button>
                </div>

            </div>
        </div>
    )
}

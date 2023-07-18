"use client"
import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import { useRouter } from "next/router";

class Soal {
    public pertanyaan: string = "";
    public pilihan: Array<{
        value: string,
        content: string
    }> = [];
    public jawaban: {
        value: string,
        content: string
    } = {
            value: "",
            content: ""
        };

    Soal(pertanyaan: string, pilihan: Array<{
        value: string,
        content: string
    }>, jawaban: {
        value: string,
        content: string
    }) {
        this.pertanyaan = pertanyaan;
        this.pilihan = pilihan;
        this.jawaban = jawaban;
    }
}

export default function full() {
    const router = useRouter()

    const config = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
    });

    const api = new OpenAIApi(config);

    // const api = new ChatGPTAPI({
    //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
    //     debug: true,
    //     completionParams: {
    //         model: 'gpt-3.5-turbo-16k-0613',
    //         temperature: 0.5,
    //         max_tokens: 5000,
    //     }
    // });

    const [soal, setSoal] = useState<Soal[]>([]);
    const [status, setStatus] = useState<string>("");
    const [form, setForm] = useState({
        grade : "",
        subject: "",
        topic: "",
        num_questions: 10,
        num_possible_answers: 5,
    });

    const prompt = `Buatlah kuis dengan pilihan ganda pada mata pelajaran {self.subject} topik {self.topic} untung jenjang {self.grade} yang terdiri dari {self.num_questions} pertanyaan. Setiap pertanyaan memiliki {self.num_possible_answers} pilihan jawaban. Formatnya seperti json dalam 1 baris panjang dan dibungkus array dengan key soal,pilihan,jawaban agar mudah di parse. Contoh formatnya seperti ini:
    [{"soal":"soal","pilihan":[{"value":"a","content":"pilihan1"},{"value":"b","content":"pilihan2"}],"jawaban":{"value":"","content":"jawaban1"}},{"soal":"soal","pilihan":[{"value":"a","content":"pilihan1"},{"value":"b","content":"pilihan2"}],"jawaban":{"value":"","content":"jawaban2"}}]`;

    const submitHandler = async () => {
        setStatus("loading");
        const formattedPrompt = prompt
            .replace("{self.subject}", form.subject)
            .replace("{self.topic}", form.topic)
            .replace("{self.grade}", form.grade)
            .replace("{self.num_questions}", form.num_questions.toString())
            .replace("{self.num_possible_answers}", form.num_possible_answers.toString());
        const result = await api.createCompletion({
            model: 'text-davinci-003',
            prompt: formattedPrompt,
            max_tokens: 2000,
        }).then((response) => {
            localStorage.removeItem('soal');
            localStorage.setItem('soal', response.data.choices[0].text?.replace('\n', '') as string);
            const rawSoal = JSON.parse(response.data.choices[0].text?.replace('\n', '') as string);
            const soalList: Soal[] = [];
            rawSoal.forEach((element: any) => {
                const soalTemp = new Soal();
                soalTemp.pertanyaan = element.soal;
                soalTemp.pilihan = element.pilihan;
                soalTemp.jawaban = element.jawaban;
                soalList.push(soalTemp);
            });
            setSoal(soalList);
            setStatus("success");
            router.push('/teacher-app/full/pengerjaan')
        }).catch((err) => {
            setStatus("error");
            console.log(err);
        });
    };


    return (
        <div className="bg-white flex justify-center h-screen">
            <div className="my-auto w-full flex flex-col gap-5">
                <form className="w-3/4 mx-auto border p-5 shadow-md rounded-xl">
                    <div className="flex flex-col gap-5 text-black">
                        <div className="flex justify-center">
                            <div className="text-2xl font-semibold">Exam AI</div>
                        </div>
                        <div className="text-red-600 mx-auto text-lg">
                            ⚠️Perhatian! Terlalu banyak pertanyaan akan menyebabkan komputasi yang tinggi dan Berpotensi Error!⚠️
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="grade" className="text-black">Jenjang</label>
                            <select
                                className="mt-1 block w-full p-2 resize-y col-span-4 h-10 border-2 rounded-lg"
                                name="grade"
                                id="grade"
                                value={form.grade}
                                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                            >
                                <option value="1 SD">1 SD</option>
                                <option value="2 SD">2 SD</option>
                                <option value="3 SD">3 SD</option>
                                <option value="4 SD">4 SD</option>
                                <option value="5 SD">5 SD</option>
                                <option value="6 SD">6 SD</option>
                                <option value="1 SMP">1 SMP</option>
                                <option value="2 SMP">2 SMP</option>
                                <option value="3 SMP">3 SMP</option>
                                <option value="1 SMA/SMK">1 SMA/SMK</option>
                                <option value="2 SMA/SMK">2 SMA/SMK</option>
                                <option value="3 SMA/SMK">3 SMA/SMK</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="subject" className="text-black">Mata Pelajaran</label>
                            <input
                                className="mt-1 block w-full p-2 resize-y col-span-4 h-10 border-2 rounded-lg"
                                name="subject"
                                id="subject"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="topic" className="text-black">Topik</label>
                            <input
                                className="mt-1 block w-full p-2 resize-y col-span-4 h-10 border-2 rounded-lg"
                                name="topic"
                                id="topic"
                                value={form.topic}
                                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="num_questions" className="text-black">Jumlah Pertanyaan</label>
                            <input
                                className="mt-1 block w-full p-2 resize-y col-span-4 h-10 border-2 rounded-lg"
                                name="num_questions"
                                id="num_questions"
                                type="number"
                                value={form.num_questions}
                                onChange={(e) => setForm({ ...form, num_questions: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="num_possible_answers" className="text-black">Jumlah Pilihan Jawaban</label>
                            <input
                                className="mt-1 block w-full p-2 resize-y col-span-4 h-10 border-2 rounded-lg"
                                name="num_possible_answers"
                                id="num_possible_answers"
                                type="number"
                                value={form.num_possible_answers}
                                onChange={(e) => setForm({ ...form, num_possible_answers: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="mt-7 flex flex-col gap-3">
                        <div className="flex justify-center">
                            {status === "error" ? <div className="text-2xl font-semibold text-red-600">Terjadi kesalahan, silahkan coba lagi</div> : ""}
                        </div>
                        <div className="flex justify-center">
                            {status === "loading" ?
                                <div className="flex flex-col gap-5">
                                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                                    <div className="text-2xl font-semibold text-black">Sedang membuat soal...</div>
                                </div> :
                                status === "success" ?
                                    <div className="flex flex-col gap-5">
                                        <div className="text-2xl font-semibold text-black">Soal berhasil dibuat</div>
                                        <div className="text-2xl font-semibold text-black">Silahkan lanjut ke pengerjaan</div>
                                    </div> :
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            submitHandler();
                                        }}
                                        className="bg-green-600 text-white hover:bg-green-600 py-5 px-5 rounded-lg text-2xl font-semibold w-1/2">
                                        Mulai
                                    </button>
                            }
                        </div>
                    </div>
                </form>


            </div>
        </div>
    );
}

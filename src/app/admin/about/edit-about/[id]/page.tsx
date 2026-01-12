'use client';

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface Card {
    id: number;
    title_en: string;
    text_en: string;
    title_ru: string;
    text_ru: string;
}

interface UpdateData {
    title_en: string;
    text_en: string;
    title_ru: string;
    text_ru: string;
}

const EditAbout = () => {
    const {id} = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Card | null>(null);

    const [titleEn, setTitleEn] = useState('');
    const [textEn, setTextEn] = useState('');
    const [titleRu, setTitleRu] = useState('');
    const [textRu, setTextRu] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const aboutData: Card = await response.json();

            setData(aboutData);
            setTitleEn(aboutData.title_en || '');
            setTextEn(aboutData.text_en || '');
            setTitleRu(aboutData.title_ru || '');
            setTextRu(aboutData.text_ru || '');
        } catch (err) {
            console.error('Ошибка загрузки', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена');
            return;
        }

        if (!titleEn || !titleRu) {
            return;
        }

        const aboutData: UpdateData = {
            title_en: titleEn,
            text_en: textEn,
            title_ru: titleRu,
            text_ru: textRu
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(aboutData),
            });

            const responseData = await res.json();

            if (res.ok) {
                router.push('/admin/about');
            } else {
                console.error('Ошибка сохранения:', responseData);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 p-10 ml-62 flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 p-10 ml-62 flex items-center justify-center">
                    <div className="text-red-500 text-lg">data not available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100">
            <div className="flex">
                <Sidebar/>
                <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                    <TokenTimer/>
                    <div className="mt-8 mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                Edit about: {data.title_en}
                            </h2>

                            <div className="tabs tabs-lift mb-6">
                                <input
                                    type="radio"
                                    name="product_tabs"
                                    className="tab"
                                    aria-label="English"
                                    defaultChecked
                                    id="tab-english"
                                />
                                <div className="tab-content bg-base-100 border-base-300 rounded-lg p-6">
                                    <div className="mb-6">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Title card (English):
                                        </label>
                                        <input
                                            type="text"
                                            value={titleEn}
                                            onChange={(e) => setTitleEn(e.target.value)}
                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Введите название на английском"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Text card (English):
                                        </label>
                                        <TipTapEditor
                                            content={textEn}
                                            onChange={setTextEn}
                                        />
                                    </div>
                                </div>

                                <input
                                    type="radio"
                                    name="product_tabs"
                                    className="tab"
                                    aria-label="Russian"
                                    id="tab-russian"
                                />
                                <div className="tab-content bg-base-100 border-base-300 rounded-lg p-6">
                                    <div className="mb-6">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Title card (Русский)*:
                                        </label>
                                        <input
                                            type="text"
                                            value={titleRu}
                                            onChange={(e) => setTitleRu(e.target.value)}
                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Введите название на русском"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Text card (Русский):
                                        </label>
                                        <TipTapEditor
                                            content={textRu}
                                            onChange={setTextRu}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/about')}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg text-white font-bold py-3 px-4 rounded-lg transition duration-200 cursor-pointer"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAbout;
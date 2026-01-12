'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

const AddAbout = () => {
    const [isClient, setIsClient] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [titleEn, setTitleEn] = useState('');
    const [textEn, setTextEn] = useState('');
    const [titleRu, setTitleRu] = useState('');
    const [textRu, setTextRu] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена');
            return;
        }

        const productData = {
            title_en: titleEn,
            text_en: textEn,
            title_ru: titleRu,
            text_ru: textRu,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setTitleEn('');
                setTextEn('');
                setTitleRu('');
                setTextRu('');

                router.push('/admin/about');
            } else {
                console.error('Ошибка при добавлении:', responseData);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

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
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add about card</h2>

                            {isClient && (
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
                                            <label className="block text-gray-700 font-semibold mb-2">
                                                Title card (English)*:
                                            </label>
                                            <input
                                                value={titleEn}
                                                onChange={(e) => setTitleEn(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">
                                               Text card (English):
                                            </label>
                                            <TipTapEditor
                                                content={textEn}
                                                onChange={(content) => setTextEn(content)}
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
                                            <label className="block text-gray-700 font-semibold mb-2">
                                                Title card (Русский)*:
                                            </label>
                                            <input
                                                value={titleRu}
                                                onChange={(e) => setTitleRu(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">
                                                Text card (Русский):
                                            </label>
                                            <TipTapEditor
                                                content={textRu}
                                                onChange={(content) => setTextRu(content)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/products')}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    Add card
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAbout;
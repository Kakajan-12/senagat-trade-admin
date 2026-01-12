'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

interface DataItem {
    id: number;
    logo: string;
}

const EditHeader = () => {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DataItem | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchHeaderData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки данных');
                }

                const data: DataItem = await response.json();
                setData(data);

                if (data.logo) {
                    setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}/${data.logo}`);
                }

            } catch (err) {
                console.error('Ошибка загрузки:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHeaderData();
    }, [id, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена');
            return;
        }

        const formData = new FormData();
        if (imageFile) {
            formData.append('logo', imageFile);
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                const result = await res.json();
                console.log('Успешно обновлено:', result);
                router.push('/admin/partners');
            } else {
                const errorText = await res.text();
                console.error('Ошибка сохранения:', errorText);
                alert(`Ошибка: ${errorText}`);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
            alert('Ошибка сети');
        }
    };

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-10 ml-62 flex items-center justify-center">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-10 ml-62 flex items-center justify-center">
                    <div className="text-lg text-red-500">Данные не найдены</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                    <TokenTimer />

                    <div className="mt-8 mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                        >
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Logo:
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="border border-gray-300 rounded p-3 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Current Logo:
                                    </label>
                                    <div className="border border-gray-300 rounded p-4 flex items-center justify-center h-64 bg-gray-50">
                                        {previewImage ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">
                                                There is no image to display.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Current logo: {data.logo}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    <h3 className="font-semibold mb-2">Information:</h3>
                                    <p><span className="font-medium">ID:</span> {data.id}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/partners')}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded transition duration-200 cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200 cursor-pointer"
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

export default EditHeader;
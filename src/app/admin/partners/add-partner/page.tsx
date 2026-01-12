'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/16/solid';

const AddPartner = () => {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите файл изображения');
                return;
            }

            // Проверка размера файла (максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }

            setLogoFile(file);
            setError(null);

            // Создаем превью
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!logoFile) {
            setError('Пожалуйста, выберите логотип');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Пожалуйста, войдите в систему');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Не указываем Content-Type для FormData - браузер сам установит
                },
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                // Показываем сообщение об успехе
                alert('Партнер успешно добавлен!');
                router.push('/admin/partners');
            } else {
                setError(`Ошибка: ${responseData.error || 'Неизвестная ошибка'}`);
                console.error('Ошибка при добавлении:', responseData);
            }
        } catch (error) {
            setError('Ошибка сети или сервера');
            console.error('Ошибка запроса', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/partners');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <Sidebar/>
                <div className="flex-1 p-6 lg:p-10 ml-0 lg:ml-62">
                    <TokenTimer/>

                    <div className="mt-8 max-w-2xl mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Добавить нового партнера</h2>

                            {/* Поле для загрузки логотипа */}
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Логотип партнера*
                                </label>

                                {/* Инпут для файла */}
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                                    <div className="text-center">
                                        {previewImage ? (
                                            <div className="flex flex-col items-center">
                                                <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-lg bg-gray-100">
                                                    <img
                                                        src={previewImage}
                                                        alt="Предпросмотр логотипа"
                                                        className="w-full h-full object-contain p-4"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLogoFile(null);
                                                        setPreviewImage(null);
                                                    }}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Удалить изображение
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                    <label
                                                        htmlFor="logo-upload"
                                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                                    >
                                                        <span>Загрузить файл</span>
                                                        <input
                                                            id="logo-upload"
                                                            name="logo"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                    <p className="pl-1">или перетащите сюда</p>
                                                </div>
                                                <p className="text-xs leading-5 text-gray-600">
                                                    PNG, JPG, WEBP до 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Альтернативный инпут */}
                                {!previewImage && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <ArrowUpTrayIcon className="w-8 h-8 mb-3 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Нажмите для загрузки</span> или перетащите
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, WEBP (Макс. 5MB)
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <p className="mt-2 text-sm text-red-600">{error}</p>
                                )}

                                <p className="mt-2 text-sm text-gray-500">
                                    * - обязательное поле
                                </p>
                            </div>

                            {/* Информация */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-800 mb-2">Требования к изображению:</h3>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Форматы: PNG, JPG, WEBP</li>
                                    <li>• Максимальный размер: 5MB</li>
                                    <li>• Рекомендуемый размер: квадратное изображение (например, 300x300 пикселей)</li>
                                    <li>• Фон: прозрачный или белый</li>
                                </ul>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !logoFile}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                            Добавление...
                                        </>
                                    ) : (
                                        'Добавить партнера'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPartner;
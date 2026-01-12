'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface Category {
    id: number;
    category_name: string;
}

const AddProduct = () => {
    const [isClient, setIsClient] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [nameEn, setNameEn] = useState('');
    const [textEn, setTextEn] = useState('');
    const [nameRu, setNameRu] = useState('');
    const [textRu, setTextRu] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена');
            return;
        }

        const productData = {
            name_en: nameEn,
            text_en: textEn,
            name_ru: nameRu,
            text_ru: textRu,
            category_id: categoryId
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setNameEn('');
                setTextEn('');
                setNameRu('');
                setTextRu('');
                setCategoryId('');

                router.push('/admin/products');
            } else {
                console.error('Ошибка при добавлении:', responseData);
                alert(`Ошибка: ${responseData.error || 'Неизвестная ошибка'}`);
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
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add new product</h2>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Категория:
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {loadingCategories ? (
                                        <option disabled>loading...</option>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.category_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Nope category</option>
                                    )}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select a category for the product
                                </p>
                            </div>

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
                                                Product name (English)*:
                                            </label>
                                            <input
                                                value={nameEn}
                                                onChange={(e) => setNameEn(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter product name in English"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">
                                               Description (English):
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
                                                Product name (Русский)*:
                                            </label>
                                            <input
                                                value={nameRu}
                                                onChange={(e) => setNameRu(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Введите название продукта на русском"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">
                                                Description (Русский):
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
                                    Add product
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
'use client';

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface Product {
    id: number;
    name_en: string;
    text_en: string;
    name_ru: string;
    text_ru: string;
    category_id?: number | null;
    category_name?: string;
}

interface Category {
    id: number;
    category_name: string;
}

interface ProductUpdateData {
    name_en: string;
    text_en: string;
    name_ru: string;
    text_ru: string;
    category_id?: number | null;
}

const EditProduct = () => {
    const {id} = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [nameEn, setNameEn] = useState('');
    const [textEn, setTextEn] = useState('');
    const [nameRu, setNameRu] = useState('');
    const [textRu, setTextRu] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const productData: Product = await response.json();

                setProduct(productData);
                setNameEn(productData.name_en || '');
                setTextEn(productData.text_en || '');
                setNameRu(productData.name_ru || '');
                setTextRu(productData.text_ru || '');

                if (productData.category_id !== undefined && productData.category_id !== null) {
                    setCategoryId(productData.category_id.toString());
                }

            } catch (err) {
                console.error('Ошибка загрузки продукта:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        fetchCategories();
    }, [id, router]);

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

        if (!nameEn || !nameRu) {
            return;
        }

        const productData: ProductUpdateData = {
            name_en: nameEn,
            text_en: textEn,
            name_ru: nameRu,
            text_ru: textRu
        };

        if (categoryId && !isNaN(Number(categoryId))) {
            productData.category_id = parseInt(categoryId);
        } else {
            productData.category_id = null;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const responseData = await res.json();

            if (res.ok) {
                router.push('/admin/products');
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

    if (!product) {
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
                                Edit product: {product.name_en}
                            </h2>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Category:
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    disabled={loadingCategories}
                                >
                                    {loadingCategories ? (
                                        <option disabled>loading...</option>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.category_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>data not found</option>
                                    )}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    {product.category_name && `current category: ${product.category_name}`}
                                </p>
                            </div>

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
                                            Product name (English):
                                        </label>
                                        <input
                                            type="text"
                                            value={nameEn}
                                            onChange={(e) => setNameEn(e.target.value)}
                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Введите название на английском"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Description (English):
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
                                            Product name (Русский)*:
                                        </label>
                                        <input
                                            type="text"
                                            value={nameRu}
                                            onChange={(e) => setNameRu(e.target.value)}
                                            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Введите название на русском"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Description (Русский):
                                        </label>
                                        <TipTapEditor
                                            content={textRu}
                                            onChange={setTextRu}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold mb-2 text-gray-700">Information:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">ID:</span> {product.id}
                                    </p>
                                    {product.category_name && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Текущая категория:</span> {product.category_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/products')}
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

export default EditProduct;
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    TextField,
    InputLabel,
    FormControl,
    Box,
    Button,
} from '@mui/material';

const ProductListTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        sort: '',
    });
    const [data, setData] = useState({
        total: 1,
    })
    const limit = 10; // Number of products to fetch per page

    // Fetch categories (to populate category filter dropdown)
    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://dummyjson.com/products/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Fetch products with filters and sorting
    const fetchProducts = async () => {
        if (products.length < data.total) {
            try {
                setLoading(true);
                const skip = (page - 1) * limit;
                const params = {
                    skip,
                    limit,
                    ...(filters.category && { category: filters.category }),
                    ...(filters.minPrice && { minPrice: filters.minPrice }),
                    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                    ...(filters.minRating && { minRating: filters.minRating }),
                    ...(filters.sort && { sort: filters.sort }),
                };
                let url = 'https://dummyjson.com/products';
                if (filters.category) {
                    url = `https://dummyjson.com/products/category/${filters.category}`;
                }
                const response = await axios.get(url, { params });
                setProducts((prevProducts) =>
                    page === 1 ? response.data.products : [...prevProducts, ...response.data.products]
                ); // Append new products or reset if it's a new filter/sort
                setData(response.data);
                setLoading(false);

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }

    };

    // Handle scroll event
    const handleScroll = useCallback(
        (event) => {
            const { scrollTop, scrollHeight, clientHeight } = event.target;
            const tolerance = 10;

            if (scrollHeight - scrollTop <= clientHeight + tolerance && !loading) {
                setPage((prevPage) => prevPage + 1);
            }
        },
        [loading]
    );

    // Handle filter/sort changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleApplyFilters = () => {
        setPage(1); // Reset to first page
        setData({total: 1});
        setProducts([]);
        fetchProducts(); // Fetch products with new filters
    };

    useEffect(() => {
        fetchCategories(); // Fetch categories on initial render
    }, []);

    useEffect(() => {
        fetchProducts(); // Fetch products whenever page changes
    }, [page]);

    // Render loading state
    if (loading && page === 1) {
        return <h2>Loading...</h2>;
    }

    // Render error state
    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <Box>
            {/* Filter and Sorting Section */}
            <Box display="flex" gap={2} mb={2}>
                <FormControl>
                    <InputLabel>Category</InputLabel>
                    <Select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        style={{ width: 200 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category} value={category.slug}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Min Price"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    type="number"
                    style={{ width: 100 }}
                />
                <TextField
                    label="Max Price"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    type="number"
                    style={{ width: 100 }}
                />
                <TextField
                    label="Min Rating"
                    name="minRating"
                    value={filters.minRating}
                    onChange={handleFilterChange}
                    type="number"
                    style={{ width: 100 }}
                />
                <FormControl>
                    <InputLabel>Sort</InputLabel>
                    <Select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        style={{ width: 200 }}
                    >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="price_asc">Price: Low to High</MenuItem>
                        <MenuItem value="price_desc">Price: High to Low</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" color="primary" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </Box>

            {/* Product Table */}
            <TableContainer
                component={Paper}
                style={{ maxHeight: 400, overflow: 'auto' }}
                onScroll={handleScroll}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="center">Rating</TableCell>
                            <TableCell align="center">Image</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.title}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell align="center">{product.rating}</TableCell>
                                <TableCell align="center">
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {loading && <p style={{ textAlign: 'center' }}>Loading more products...</p>}
            </TableContainer>
        </Box>
    );
};

export default ProductListTable;

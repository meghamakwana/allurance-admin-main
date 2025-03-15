import React, { useState, useEffect, useMemo } from 'react';
import { Tab, Tabs, Card, TextField, Button, Typography, useTheme, Table, TableHead, TableRow, TableCell, TableBody, IconButton, MenuItem, Select, FormControl, InputLabel, Grid, FormControlLabel, RadioGroup, Radio, Modal } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { ManageAPIsData, convertSvgToPng, generateBarcodeUrl } from 'src/utils/commonFunction';
import { INE_CREATE_ORDERS, INE_SEARCH_USER_BY_PHONE_NUMBER, OFFLINE_SALES_COUPONS_ENDPOINT, OFFLINE_SALES_CREATE_USER_ENDPOINT, OFFLINE_SALES_GIFTCARD_VERIFY_ENDPOINT, OFFLINE_SALES_OTP_VERIFY_ENDPOINT, OFFLINE_SALES_SEARCH_PRODUCT_BY_SERIAL_NUMBER_ENDPOINT, OFFLINE_SALES_SEARCH_PRODUCT_BY_MODEL_NUMBER_ENDPOINT, OFFLINE_SALES_USER_ADDRESSES_ENDPOINT } from 'src/utils/apiEndPoints';
import { Box, Stack } from '@mui/system';
import Iconify from 'src/components/iconify';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import html2pdf from 'html2pdf.js';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { RHFTextField } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { LoadingButton } from '@mui/lab';
import { payment } from 'src/action/ServerActions';
import { useRouter } from 'src/routes/hooks';

export default function InvoiceListView() {

    const theme = useTheme();
    const [giftCardData, setGiftCardData] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const [tabValue, setTabValue] = useState('searchUser');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const [userAddresses, setUserAddresses] = useState([]);
    const [userNotFound, setUserNotFound] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState({});
    const [isSearchPerformed, setIsSearchPerformed] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [userSearched, setUserSearched] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState('');
    const [couponRedemptions, setCouponRedemptions] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [deliveryOption, setDeliveryOption] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const handleDeliveryChange = (event) => {
        setDeliveryOption(event.target.value);
    };
    const [newUserDetails, setNewUserDetails] = useState({
        name: '',
        email: '',
    });
    const [addressDetails, setAddressDetails] = useState({
        address_1: '',
        address_2: '',
        landmark: '',
        pincode: '',
        state: '',
        country: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [giftCardValue, setGiftCardValue] = useState('');
    const [giftCardAmount, setGiftCardAmount] = useState(null);
    const [otp, setOtp] = useState('');
    const [isGiftCardVerified, setIsGiftCardVerified] = useState(false);

    const handleClear = () => {
        setUserDetails(null);
        setDeliveryOption(null);
        setPhoneNumber('');
        setAddressDetails({});
        setSelectedAddress({});
        setUserNotFound(false)
        setSelectedProducts([]);
        setSearchedProducts([]);
        setGiftCardValue('');
        setVerificationMessage('');
        setIsGiftCardVerified(false);
        setOtp('');
        setSearchQuery('')
        setSelectedCoupon('');
        setCoupons([]);
        setTabValue('searchUser');
    };

    const handleDeleteSelectedProduct = (productId) => {
        const updatedProducts = selectedProducts.filter(product => product.id !== productId);
        setSelectedProducts(updatedProducts);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePhoneNumberChange = (event) => {
        setValue('phonenumber', event.target.value);
        setUserDetails(null)
        setUserNotFound(false)
        setPhoneNumber(event.target.value);
    };

    const handleNewUserDetailsChange = (event) => {
        const { name, value } = event.target;
        setNewUserDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSaveAddressDetails = async () => {

        if (!userSearched) {
            try {
                await createAddress();
                setTabValue('chooseProduct');
            } catch (error) {
                console.error('Error creating address:', error);
                enqueueSnackbar('Failed to save address', { variant: 'error' });
            }
        } else {
            setTabValue('chooseProduct');
        }
    };

    const createAddress = async () => {
        try {
            // Make API call to create the address
            const apiUrl = OFFLINE_SALES_USER_ADDRESSES_ENDPOINT;
            const requestData = {
                // Include address details here
                address_1: addressDetails.address_1,
                address_2: addressDetails.address_2,
                landmark: addressDetails.landmark,
                pincode: addressDetails.pincode,
                state: addressDetails.state,
                country: addressDetails.country,
                // Include user ID if needed
                prefix_id: userDetails.prefix_id,
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                // Show snackbar for successful address creation
                enqueueSnackbar('User address created successfully', { variant: 'success' });
            } else {
                enqueueSnackbar('Failed to create address', { variant: 'error' });
                console.error('Failed to create address');
                throw new Error('Failed to create address');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleAddressDetailsChange = (event) => {
        const { name, value } = event.target;
        setAddressDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const NewProductSchema = Yup.object().shape({
        phonenumber: Yup.string().required('Phone Number is required'),
    });


    const defaultValues = useMemo(
        () => ({
            phonenumber: '',
        }),
        []
    );

    const methods = useForm({
        resolver: yupResolver(NewProductSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();


    const onSubmit = handleSubmit(async (data) => {
        // const handleSubmit = async () => {
        try {
            const apiUrl = `${INE_SEARCH_USER_BY_PHONE_NUMBER}`;
            const requestData = {
                phone_number: phoneNumber // Include the phone number in the request body
            };
            const response = await ManageAPIsData(apiUrl, 'POST', requestData);


            if (response.ok) { // Check if the response status is OK (200-299)
                const foundUser = await response.json();
                // console.log("USER DETAILS", foundUser.data)
                setUserDetails(foundUser.data[0]); // Store the user details
                setUserNotFound(false);
                setUserSearched(true);
                enqueueSnackbar('User found');
            } else {
                const errorData = await response.json();

                enqueueSnackbar('User Not Found', { variant: 'error' });
                setUserDetails(null);
                setUserNotFound(true);
            }
        } catch (error) {
            console.error('Error fetching user:', error.message);
            enqueueSnackbar('Error fetching user details!', { variant: 'error' });
        }
    })

    const handleCreateUser = async (event) => {
        event.preventDefault();
        try {
            const apiUrl = OFFLINE_SALES_CREATE_USER_ENDPOINT;
            const requestData = {
                ...newUserDetails,
                phone_number: phoneNumber
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            if (response.ok) {
                setUserNotFound(false);
                enqueueSnackbar('User created!', { variant: 'success' });

                const userData = await response.json();
                const newUser = userData.data[0];
                setUserDetails(newUser);

                setTabValue('addAddress');
                setShowCreateUserForm(false);
            } else {
                const errorData = await response.json();
                console.error('Error creating user:', errorData);
                enqueueSnackbar('Failed to create user', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            enqueueSnackbar('Failed to create user', { variant: 'error' });
        }
    };

    const handleCheckout = () => {
        setTabValue('checkout');
    };

    useEffect(() => {
        if (userDetails?.id) {
            fetchUserAddresses(userDetails?.id);
        }
    }, [userDetails]);

    const fetchUserAddresses = async (userId) => {
        try {
            const apiUrl = `${OFFLINE_SALES_USER_ADDRESSES_ENDPOINT}?id=${userId}`;
            const response = await ManageAPIsData(apiUrl, 'GET');
            if (response.ok) {
                const addressesData = await response.json();
                setUserAddresses(addressesData.data);
            } else {
                console.error('Failed to fetch user addresses');
            }
        } catch (error) {
            console.error('Error fetching user addresses:', error.message);
        }
    };

    const handleAddressChange = (event) => {
        const selectedAddressId = event.target.value;
        // console.log("ADDRESS", selectedAddressId);
        const selectedAddress = userAddresses.find(address => address.id === selectedAddressId);
        if (selectedAddress) {
            setAddressDetails({
                addressId: selectedAddress.id || '',
                address_1: selectedAddress.address_1 || '',
                address_2: selectedAddress.address_2 || '',
                landmark: selectedAddress.landmark || '',
                pincode: selectedAddress.pincode || '',
                state: selectedAddress.state || '',
                country: selectedAddress.country || '',
            });
            setSelectedAddress(selectedAddress.id); // Update the selected address ID
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            await fetchProductDetails();
        }
    };

    const fetchProductDetails = async () => {
        setIsLoading(true);
        try {
            if (searchQuery.trim() == '') {
                return;
            }
            const apiUrl = (deliveryOption == 1 ? OFFLINE_SALES_SEARCH_PRODUCT_BY_MODEL_NUMBER_ENDPOINT : OFFLINE_SALES_SEARCH_PRODUCT_BY_SERIAL_NUMBER_ENDPOINT)  + `/${searchQuery}`;
            const response = await ManageAPIsData(apiUrl, 'GET');
            if (response.ok) {
                let productData = await response.json();
                productData = productData.data;
                if(!productData.length) {
                    productData = [productData]
                }
                productData.map((pd) => {
                    const price = pd.price || pd.pbaseprice;
                    const gst = Number(pd.gstPercentage);;
                    const gstPrice = price * (gst / 100);
                    const basePrice = price - gstPrice;

                    pd.gst = gst;
                    pd.gstPrice = gstPrice;
                    pd.basePrice = basePrice;
                    pd.price = price;

                    return pd
                })
                // Update the state with the fetched product data
                setSearchedProducts(productData);
                setIsSearchPerformed(true); // Set search performed flag to true
                setIsLoading(false);
            } else {
                console.error('Failed to fetch product details');
                enqueueSnackbar('Failed to fetch product details', { variant: 'error' });
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching product details:', error.message);
            enqueueSnackbar('Error fetching product details', { variant: 'error' });
            setIsLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        const isProductSelected = selectedProducts.some((selectedProduct) => selectedProduct.id === product.id);
        if (!isProductSelected) {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const updateTotalAmount = (amount) => {
        setTotalAmount(prevTotal => prevTotal - amount);
    };

    const handleGiftCardChange = (e) => {
        let formattedValue = e.target.value.replace(/\D/g, '');
        formattedValue = formattedValue.replace(/(.{4})/g, '$1-').slice(0, 19);
        setGiftCardValue(formattedValue);
    };

    const handleGiftCardVerify = async () => {
        try {
            const response = await fetch(`${OFFLINE_SALES_GIFTCARD_VERIFY_ENDPOINT}?id=${giftCardValue}`);
            if (response.ok) {
                const responsedata = await response.json();
                if (responsedata.status == true && responsedata.data) {
                    const giftCard = await responsedata.data;
                    // console.log("giftCardgiftCardgiftCardgiftCard", giftCard)
                    if (responsedata.status == true) {
                        setIsGiftCardVerified(true);
                        setVerificationMessage('Gift card is genuine');
                        setGiftCardData(giftCard);  // Store gift card data
                    } else {
                        setIsGiftCardVerified(false);
                        setVerificationMessage('Gift card is invalid');
                        setGiftCardData(null);  // Clear gift card data
                        console.error('Gift card is invalid');
                    }
                } else {
                    setIsGiftCardVerified(false);
                    setVerificationMessage('Failed to verify gift card');
                    setGiftCardData(null);  // Clear gift card data
                    console.error('Failed to verify gift card');
                }
            } else {
                setIsGiftCardVerified(false);
                setVerificationMessage('Failed to verify gift card');
                setGiftCardData(null);  // Clear gift card data
                console.error('Failed to verify gift card');
            }
        } catch (error) {
            setIsGiftCardVerified(false);
            setVerificationMessage('Error verifying gift card');
            setGiftCardData(null);  // Clear gift card data
            console.error('Error verifying gift card:', error.message);
        }
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleOtpVerify = async () => {
        try {
            const response = await fetch(OFFLINE_SALES_OTP_VERIFY_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ giftCard: giftCardValue, otp })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status == true) {

                    // Deduct the gift card amount from the total amount
                    updateTotalAmount(giftCardData?.amount); // Assuming the API returns the amount after OTP verification
                    console.log('Gift card amount deducted');
                } else {
                    console.error('OTP is invalid');
                }
            } else {
                console.error('Failed to verify OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error.message);
        }
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => total + product.basePrice * product.quantity, 0);
    };

    const calculateTax = () => {
        return selectedProducts.reduce((total, product) => total + product.gstPrice * product.quantity, 0);;
    };

    const calculateDiscount = () => {
        if (selectedCoupon) {
            const coupon = coupons.find(coupon => coupon.coupon_code === selectedCoupon);
            if (coupon) {
                const discount = Math.min(calculateTotal() * (coupon.discount_percentage / 100), coupon.max_discount_in_price);
                return discount;
            }
        }
        return 0;
    };

    const calculateBaseAmount = () => {
        return calculateTotal();
    };

    const calculateFinalPayment = () => {
        const baseAmount = calculateBaseAmount();
        const tax = calculateTax();
        const totalAmount = baseAmount + tax;

        // Subtract the discount amount only if a valid coupon is selected
        const discountedAmount = selectedCoupon && discountAmount > 0 ? totalAmount - discountAmount : totalAmount;
        return discountedAmount;
    };

    useEffect(() => {
        const fetchCoupons = async () => {
            setIsLoading(true);
            try {
                const apiUrl = OFFLINE_SALES_COUPONS_ENDPOINT; // Replace with your API endpoint
                const response = await fetch(apiUrl); // Replace with your API endpoint
                if (response.ok) {
                    const data = await response.json();
                    setCoupons(data.data);
                } else {
                    console.error('Failed to fetch coupons');
                    enqueueSnackbar('Failed to fetch coupons', { variant: 'error' });
                }
            } catch (error) {
                console.error('Error fetching coupons:', error.message);
                enqueueSnackbar('Error fetching coupons', { variant: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const handleCouponSelection = (event) => {
        const selectedCouponCode = event.target.value;
        if (selectedCouponCode === '') {
            // Reset all states when no coupon is selected
            setSelectedCoupon('');
            setCouponRedemptions(0);
            setCouponError('');
            setDiscountAmount(0);
            return;
        }
        const selectedCouponData = coupons.find(coupon => coupon.coupon_code === selectedCouponCode);
        if (!selectedCouponData) {
            setCouponRedemptions(0);
            setCouponError('Selected coupon is not valid');
            setDiscountAmount(0);
        } else if (selectedCouponData.number_of_redemptions <= 0) {
            setCouponRedemptions(0);
            setCouponError('Number of redemptions for the selected coupon is not valid');
            setDiscountAmount(0);
        } else if (selectedCouponData.min_cart_value > calculateTotal()) {
            setCouponRedemptions(0);
            setCouponError(`Minimum cart Price must be more than ${selectedCouponData.min_cart_value}`);
            setDiscountAmount(0);
        } else if (selectedCouponData.min_cart_products > selectedProducts.length) {
            setCouponRedemptions(0);
            setCouponError(`Minimum cart Products requirement must be more than ${selectedCouponData.min_cart_products}`);
            setDiscountAmount(0);
        } else if (new Date(selectedCouponData.start_date) > new Date() || new Date(selectedCouponData.till_date) < new Date()) {
            setCouponRedemptions(0);
            setCouponError('Selected coupon is not valid currently');
            setDiscountAmount(0);
        } else {
            // All validations passed, set the discount amount
            setSelectedCoupon(selectedCouponCode);
            setCouponRedemptions(selectedCouponData.number_of_redemptions);
            setCouponError('');
            const discount = selectedCouponData.max_discount_in_price;
            setDiscountAmount(discount);

        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const gatherCheckoutData = () => {
        const STORAGE_KEY = 'accessToken';
        let accessToken;
        // Check if sessionStorage is available before trying to access it
        if (typeof sessionStorage !== 'undefined') {
            accessToken = sessionStorage.getItem(STORAGE_KEY);
            // Check if accessToken is not undefined before decoding
        } else {
            console.error("sessionStorage is not available in this environment.");
        }
        let decoded;
        let assisted_by = ''
        if (accessToken != null && accessToken !== undefined) {
            decoded = jwtDecode(accessToken);
            assisted_by = decoded.data.prefix_id;
        } else {
            console.error("accessToken is undefined. Cannot decode.");
        }
        return {
            userDetails,
            order_status: deliveryOption == 1 ? 3 : 1,
            address: addressDetails,
            channel_mode: 2,
            giftcard_id: "",
            assisted_by: assisted_by,
            cartproducts: selectedProducts,
            channel_name: deliveryOption == 1 ? 'Offline Sales Channel' : 'Online Sales Channel | Frontend',
            addressId: selectedAddress,
            baseAmount: calculateBaseAmount(),
            taxAmount: calculateTax(),
            discountAmount: calculateDiscount(),
            finalamount: calculateFinalPayment(),
            payment_by_customer: deliveryOption == 1 ? calculateFinalPayment() : "",
            payment_status: deliveryOption == 1 ? 2 : 1
        };
    };

    const handleCollectCash = async () => {

        const checkoutData = await gatherCheckoutData();
        try {
            const response = await fetch(INE_CREATE_ORDERS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData),
            });
            if (response.ok) {
                enqueueSnackbar('Order Successfull');
            } else {
                enqueueSnackbar('Failed to Order', { variant: 'error' });
            }
        } catch (error) {
            console.error('ERROR', error);
        }

        setIsModalOpen(false);
    };

    const loadTemplate = async () => {
        try {
            const response = await fetch('/html/invoice.html');
            const htmlTemplate = await response.text();
            return htmlTemplate;
        } catch (error) {
            console.error('Error fetching template:', error);
            return '';
        }
    };

    const generateBarcodeImage = async (serialNumber) => {
        const barcodeSvg = await generateBarcodeUrl(serialNumber);
        const barcodeBase64 = await convertSvgToPng(barcodeSvg);
        return barcodeBase64;
    };

    const generateHtmlContent = async (template, data) => {
        let htmlContent = await template;
        const replacePlaceholders = (content, key, value) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            return content.replace(regex, value ?? '');
        };
        const placeholders = [
            "invoice_id", "order_status", "assisted_by", "from_phone", "to_name",
            "to_address_line_1", "to_address_line_2", "to_landmark", "to_district",
            "to_state", "to_country", "to_pincode", "to_phone", "created_at", "cin",
            "gst_number", "CGST", "IGST", "SGST", "subtotal", "discount", "tax", "total"
        ];
        placeholders.forEach(key => {
            htmlContent = replacePlaceholders(htmlContent, key, data?.[key]);
        });
        const productsHtml = data?.products?.map((product, index) => `
            <tr key="${product?.id}">
                <td>${index + 1}</td>
                <td>${product?.ptitle}</td>
                <td>${product?.quantity}</td>
                <td>${product?.pbaseprice} /-</td>
                <td>${product?.pbaseprice * product?.quantity} /-</td>
            </tr>
        `).join('') ?? '';
        htmlContent = replacePlaceholders(htmlContent, 'products', productsHtml);
        return htmlContent;
    };

    const createPDF = async () => {
        try {
            const templateHtml = await loadTemplate();
            const productsData = await Promise.all(selectedProducts?.map(async (product) => {
                const barcodeUrl = await generateBarcodeImage(product?.serial_number);
                return { ...product, barcodeUrl };
            }));
            const invoiceData = {
                invoice_id: "INV-12345",
                order_status: "Pending",
                assisted_by: "Jane Smith",
                from_phone: "0987654321",
                to_name: `${userDetails?.first_name} ${userDetails?.last_name}`,
                to_address_line_1: addressDetails?.address_1,
                to_address_line_2: addressDetails?.address_2,
                to_landmark: addressDetails?.landmark,
                to_district: addressDetails?.district,  // Added district
                to_state: addressDetails?.state,
                to_country: addressDetails?.country,
                to_pincode: addressDetails?.pincode,
                to_phone: userDetails?.phone,
                created_at: new Date().toLocaleDateString(),
                products: productsData,
                subtotal: calculateBaseAmount(),
                discount: calculateDiscount(),
                tax: calculateTax(),
                total: calculateFinalPayment(),
                cin: "CIN-12345",           // Example data
                gst_number: "GSTIN-67890",  // Example data
                CGST: calculateTax(),      // Ensure you have these calculations or values
                IGST: calculateTax(),
                SGST: calculateTax()
            };
            const htmlContent = await generateHtmlContent(templateHtml, invoiceData);
            const pdfBlob = await html2pdf().from(htmlContent).output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            console.log('PDF URL:', pdfUrl); // Debugging line
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const makePayment = async (e) => {
        const FinalAmount = calculateFinalPayment();
        const orderDetails = {
            cartproducts: selectedProducts,
            user_id: userDetails?.customer_id || userDetails?.id,
            addressId: addressDetails.addressId,
            discountedAmount: calculateDiscount(),
            finalamount: calculateFinalPayment(),
            tax: calculateTax(),
            channel_mode: 2,
            channel_name: deliveryOption == 1 ? 'Offline Sales Channel' : 'Online Sales Channel | Frontend',
            payment_status: 2,
            order_status: 1
        };
        e.preventDefault();
        const FinalAmountInPaisa = Math.round(FinalAmount * 100);
        const redirect = await payment(FinalAmountInPaisa, orderDetails);
        router.push(redirect.url);
    };

    return (
        <>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                    px: 2.5,
                    boxShadow: `inset 0 -2px 0 0 ${theme.palette.grey[500]}`,
                    '& .MuiTab-root': {
                        color: 'white',
                    },
                }}>
                <Tab key="searchUser" value="searchUser" label="Search User" iconPosition="end" style={{ color: 'white' }} disabled />
                <Tab key="SetDelivery" value="SetDelivery" label="Set Delivery" iconPosition="end" style={{ color: 'white' }} disabled />
                <Tab key="addAddress" value="addAddress" label="Add Address" iconPosition="end" style={{ color: 'white' }} disabled />
                <Tab key="chooseProduct" value="chooseProduct" label="Choose Product" iconPosition="end" style={{ color: 'white' }} disabled />
                <Tab key="checkout" value="checkout" label="Checkout" iconPosition="end" style={{ color: 'white' }} disabled />
            </Tabs>

            {tabValue === 'searchUser' && !showCreateUserForm && (
                <Card variant="outlined" sx={{ p: 3, mb: 3, mt: 3 }}>
                    <FormProvider methods={methods} onSubmit={onSubmit}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {userNotFound ? 'Create New User' : 'Search User'}
                        </Typography>

                        <RHFTextField
                            name="phonenumber"
                            id="phonenumber"
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        {!userDetails && (
                            <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                                {/* <Button variant="contained" onClick={handleSubmit}>
                                Submit
                                </Button> */}
                                Submit
                            </LoadingButton>
                        )}

                    </FormProvider>
                    {userNotFound && (
                        <>
                            <Typography variant="body1" color="error" sx={{ mt: 1, mb: 2 }}>
                                No user found.
                            </Typography>
                            <Button variant="contained" onClick={() => setShowCreateUserForm(true)} sx={{ mb: 2 }}>
                                Create New User
                            </Button>
                        </>
                    )}

                    {userDetails && (
                        <>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>User Details:</Typography>
                            <Typography>{`Name: ${userDetails.first_name} ${userDetails.last_name}`}</Typography>
                            <Typography>{`Email: ${userDetails.email}`}</Typography>
                            <Typography>{`Phone: ${userDetails.phone}`}</Typography>
                            {/* You can add more user details here */}
                            <Button variant="contained" onClick={() => setTabValue('SetDelivery')} sx={{ mt: 2 }}>
                                Next
                            </Button>
                        </>
                    )}


                </Card>
            )}

            {tabValue === 'SetDelivery' && (
                <Card variant="outlined" sx={{ p: 3, mb: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Set Delivery Address
                    </Typography>

                    {userDetails && (
                        <>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>User Details:</Typography>
                            <Typography>{`Name: ${userDetails.first_name} ${userDetails.last_name}`}</Typography>
                            <Typography>{`Email: ${userDetails.email}`}</Typography>
                            <Typography>{`Phone: ${userDetails.phone}`}</Typography>
                            {/* You can add more user details here */}
                            <RadioGroup value={deliveryOption} onChange={handleDeliveryChange} sx={{ mt: 2 }}>
                                <FormControlLabel value={0} control={<Radio />} label="Deliver Now" />
                                <FormControlLabel value={1} control={<Radio />} label="Deliver to Address" />
                            </RadioGroup>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Button variant="contained" onClick={() => setTabValue(deliveryOption == 1 ? 'addAddress' : 'chooseProduct')} sx={{ mt: 2 }}>
                                    Next
                                </Button>
                                <Button onClick={() => setTabValue('searchUser')} sx={{ ml: 2, mt: 2 }}>
                                    Go Back
                                </Button>
                            </Box>
                        </>
                    )}
                </Card>
            )}
            {showCreateUserForm && (
                <Card variant="outlined" sx={{ p: 3, mb: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Create New User
                    </Typography>
                    <form onSubmit={handleCreateUser} sx={{ mt: 2 }}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={newUserDetails.firstName}
                            onChange={handleNewUserDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={newUserDetails.lastName}
                            onChange={handleNewUserDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={newUserDetails.email}
                            onChange={handleNewUserDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Phone Number"
                            name="phone"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        <Button type="submit" variant="contained">
                            Submit
                        </Button>
                        <Button onClick={() => setShowCreateUserForm(false)} sx={{ ml: 2 }}>
                            Go Back
                        </Button>
                    </form>
                </Card>
            )}

            {tabValue === 'addAddress' && (
                <>
                    <Card variant="outlined" sx={{ p: 2, mb: 2, mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Add Address
                        </Typography>
                        { userDetails && userAddresses.length > 0 && (
                            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                                <InputLabel>User Addresses</InputLabel>
                                <Select
                                    label="User Addresses"
                                    value={selectedAddress}
                                    onChange={handleAddressChange}
                                >
                                    {userAddresses.map((address) => (
                                        <MenuItem key={address.id} value={address.id}>
                                            {address.title}: {address.address_1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            label="Address Line 1"
                            name="address_1"
                            value={addressDetails.address_1}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Address Line 2"
                            name="address_2"
                            value={addressDetails.address_2}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Landmark"
                            name="landmark"
                            value={addressDetails.landmark}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Pincode"
                            name="pincode"
                            value={addressDetails.pincode}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="State"
                            name="state"
                            value={addressDetails.state}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Country"
                            name="country"
                            value={addressDetails.country}
                            onChange={handleAddressDetailsChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Button variant="contained" onClick={handleSaveAddressDetails}>
                                Save Address and Continue
                            </Button>
                            <Button onClick={() => setTabValue('SetDelivery')} sx={{ ml: 2 }}>
                                Go Back
                            </Button>
                        </Box>
                    </Card>
                </>
            )}

            {tabValue === 'chooseProduct' && (
                <>
                    {deliveryOption == 1 ? (
                        <Card variant="outlined" sx={{ p: 2, mb: 2, mt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Choose Product
                            </Typography>
                            <TextField
                                label="Search by Product Number"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <Button variant="contained" onClick={handleSearch} sx={{ mb: 2 }}>
                                Search
                            </Button>
                            {isSearchPerformed && (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Model Number</TableCell>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell>Serial Number</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {isLoading ? (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={5} style={{ textAlign: 'center', paddingTop: '20px' }}>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ) : (
                                        <TableBody>
                                            {searchedProducts?.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.model_number}</TableCell>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell style={{maxWidth: '200px', wordBreak:'break-word'}} >{product.serial_numbers}</TableCell>
                                                    <TableCell>{product.pbaseprice}/-</TableCell>
                                                    <TableCell>
                                                        <Button variant="contained" onClick={() => handleSelectProduct(product)}>
                                                            Select
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    )}
                                </Table>
                            )}
                            {selectedProducts.length > 0 && (
                                <>
                                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                                        Selected Products
                                    </Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Model Number</TableCell>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Serial Number</TableCell>
                                                <TableCell>Price</TableCell>
                                                <TableCell>Action</TableCell> {/* New column for delete action */}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.model_number}</TableCell>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell style={{maxWidth: '200px', wordBreak:'break-word'}}>{product.serial_numbers}</TableCell>
                                                    <TableCell>{product.pbaseprice}/-</TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleDeleteSelectedProduct(product.id)}>
                                                            <Iconify icon="material-symbols-light:delete" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Button variant="contained" onClick={handleCheckout}>
                                    Checkout
                                </Button>
                                <Button onClick={() => setTabValue(deliveryOption == 1 ? 'addAddress' : 'SetDelivery')}>
                                    Go Back
                                </Button>
                            </Box>
                        </Card>
                    ) : (
                        <Card variant="outlined" sx={{ p: 2, mb: 2, mt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Choose Product
                            </Typography>
                            <TextField
                                label="Search by Serial Number"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <Button variant="contained" onClick={handleSearch} sx={{ mb: 2 }}>
                                Search
                            </Button>
                            {isSearchPerformed && (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Model Number</TableCell>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell>Serial Number</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {isLoading ? (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={5} style={{ textAlign: 'center', paddingTop: '20px' }}>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ) : (
                                        <TableBody>
                                            {searchedProducts?.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.irdesignerid}</TableCell>
                                                    <TableCell>{product.ptitle}</TableCell>
                                                    <TableCell style={{maxWidth: '200px', wordBreak:'break-word'}} >{product.serial_number}</TableCell>
                                                    <TableCell>{product.pbaseprice}/-</TableCell>
                                                    <TableCell>
                                                        <Button variant="contained" onClick={() => handleSelectProduct(product)}>
                                                            Select
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    )}
                                </Table>
                            )}
                            {selectedProducts.length > 0 && (
                                <>
                                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                                        Selected Products
                                    </Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Model Number</TableCell>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Serial Number</TableCell>
                                                <TableCell>Price</TableCell>
                                                <TableCell>Action</TableCell> {/* New column for delete action */}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.irdesignerid}</TableCell>
                                                    <TableCell>{product.ptitle}</TableCell>
                                                    <TableCell style={{maxWidth: '200px', wordBreak:'break-word'}}>{product.serial_number}</TableCell>
                                                    <TableCell>{product.pbaseprice}/-</TableCell>
                                                    <TableCell>
                                                        <IconButton onClick={() => handleDeleteSelectedProduct(product.id)}>
                                                            <Iconify icon="material-symbols-light:delete" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Button variant="contained" onClick={handleCheckout}>
                                    Checkout
                                </Button>
                                <Button onClick={() => setTabValue(deliveryOption == 1 ? 'addAddress' : 'SetDelivery')}>
                                    Go Back
                                </Button>
                            </Box>
                        </Card>
                    )}
                </>
            )}

            {tabValue === 'checkout' && (
                <Card variant="outlined" sx={{ p: 2, mb: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Checkout
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>User Details:</Typography>
                            <Typography>{`Name: ${userDetails?.first_name} ${userDetails?.last_name}`}</Typography>
                            <Typography>{`Email: ${userDetails?.email}`}</Typography>
                            <Typography>{`Phone: ${userDetails?.phone}`}</Typography>
                        </div>

                        {deliveryOption == 1 && (
                            <div style={{ flex: 1, marginLeft: '20px' }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Address:</Typography>
                                <Typography>{`Address 1: ${addressDetails.address_1}`}</Typography>
                                <Typography>{`Address 2: ${addressDetails.address_2}`}</Typography>
                                <Typography>{`Landmark: ${addressDetails.landmark}`}</Typography>
                                <Typography>{`Pincode: ${addressDetails.pincode}`}</Typography>
                                <Typography>{`State: ${addressDetails.state}`}</Typography>
                                <Typography>{`Country: ${addressDetails.country}`}</Typography>
                            </div>
                        )}
                    </div>

                    {/* Display selected products */}
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Selected Products:</Typography>
                    {selectedProducts.length === 0 ? (
                        <Typography>No products selected</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Model Number</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Serial Number</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>GST %</TableCell>
                                    <TableCell>GST</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.model_number || product.irdesignerid}</TableCell>
                                        <TableCell>{product.ptitle}</TableCell>
                                        <TableCell style={{maxWidth: '200px', wordBreak:'break-word'}}>{product.serial_numbers || product.serial_number}</TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell>{product.basePrice} /-</TableCell>
                                        <TableCell>{Number(product.gstPercentage)}%</TableCell>
                                        <TableCell>{product.gstPrice} /-</TableCell>
                                        <TableCell>{product.price * product.quantity} /-</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeleteSelectedProduct(product.id)}>
                                                <Iconify icon="material-symbols-light:delete" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Stack spacing={2} marginTop={2} marginBottom={2}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={4}>
                                <TextField
                                    label="Gift Card"
                                    fullWidth
                                    variant="outlined"
                                    value={giftCardValue}
                                    onChange={handleGiftCardChange}
                                />
                            </Grid>
                            <Grid item>
                                <Button onClick={handleGiftCardVerify} variant="contained">
                                    Verify Gift Card
                                </Button>
                            </Grid>
                            {verificationMessage && (
                                <Grid item xs={12}>
                                    <Typography color={isGiftCardVerified ? 'white' : 'error'}>
                                        {verificationMessage}
                                    </Typography>
                                </Grid>
                            )}
                            {isGiftCardVerified && (
                                <>
                                    <Grid item xs={4}>
                                        <TextField
                                            label="OTP"
                                            fullWidth
                                            variant="outlined"
                                            value={otp}
                                            onChange={handleOtpChange}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button onClick={handleOtpVerify} variant="contained">
                                            Verify OTP
                                        </Button>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        {!coupons.length > 0 && (<>
                            <FormControl fullWidth variant="outlined">
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={4}>
                                        <InputLabel>Coupon Code</InputLabel>
                                        <Select
                                            label="Coupon Code"
                                            onChange={handleCouponSelection}
                                            error={couponError !== ''}
                                            helperText={couponError}
                                            value={selectedCoupon}
                                            fullWidth
                                        >
                                            <MenuItem key={1} value=''>
                                                Select
                                            </MenuItem>
                                            {coupons?.map((coupon) => (
                                                <MenuItem key={coupon.id} value={coupon.coupon_code}>
                                                    {coupon.campaign_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                </Grid>
                            </FormControl>
                            <Typography>{couponError}</Typography>
                        </>)}

                    </Stack>

                    <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
                        <Grid item xs={4}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Base Amount:</TableCell>
                                        <TableCell>{calculateBaseAmount()}/-</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>GST:</TableCell>
                                        <TableCell>{calculateTax()}/-</TableCell>
                                    </TableRow>
                                    {selectedCoupon !== '' && ( // Check if a coupon is selected
                                        <React.Fragment>
                                            <TableRow>
                                                <TableCell>Coupon Discount:</TableCell>
                                                <TableCell>-{calculateDiscount()}/-</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Final Payment:</TableCell>
                                                <TableCell>{calculateFinalPayment()}/-</TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    )}
                                    {!selectedCoupon && (
                                        <TableRow>
                                            <TableCell>Final Payment:</TableCell>
                                            <TableCell>{calculateFinalPayment()}/-</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {selectedCoupon !== '' && (
                                <TableRow>
                                    <TableCell>You saved {calculateDiscount()} rupees extra with the coupon code</TableCell>
                                </TableRow>
                            )}
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <div>
                            <Button onClick={() => createPDF()} variant="contained">
                                Generate Bill
                            </Button>
                            <Button onClick={handleOpenModal} sx={{ ml: 2 }} variant="contained">
                                Payment
                            </Button>
                        </div>
                        <div>
                            <Button onClick={() => setTabValue('chooseProduct')}>
                                Go Back
                            </Button>
                            <Button onClick={handleClear}>
                                Clear
                            </Button>
                        </div>
                    </Box>
                </Card >
            )
            }

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Collect Total Amount in Cash
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Are you sure you want to collect the total amount in cash?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={handleCloseModal} variant="outlined" sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCollectCash} variant="contained">
                            Confirm Cash Collection
                        </Button>
                        <Button onClick={makePayment} variant="contained" color="primary" sx={{ ml: 1 }}>
                            Online Payment
                        </Button>

                    </Box>

                </Box>
            </Modal>
        </>
    );
}
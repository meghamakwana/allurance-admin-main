'use client';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import html2pdf from 'html2pdf.js';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { Button, MenuItem, Select } from '@mui/material';
import { INE_ADMIN_ORDERS_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export default function InvoiceDetails({ id }) {
    const [invoice, Setinvoice] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [deliveryStatus, setDeliveryStatus] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${INE_ADMIN_ORDERS_ENDPOINT}?id=${id}`;
                const response = await ManageAPIsData(apiUrl, 'GET');

                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();

                if (Object.keys(responseData)?.length) {
                    Setinvoice(responseData?.data);
                    setCurrentStatus(responseData?.data?.order_status);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    const handleChangeStatus = (event) => {
        const newStatus = event.target.value;
        setCurrentStatus(newStatus);
        console.log(
            "newStatus", newStatus
        )
        UpdateOrderStatus(newStatus);
    };

    async function UpdateOrderStatus(orderstate) {
        try {
            const apiUrl = `${INE_ADMIN_ORDERS_ENDPOINT}?id=${id}`;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_state: orderstate })
            };

            const response = await fetch(apiUrl, requestOptions);

            if (!response.ok) {
                console.error("Error updating status:", response.statusText);
                return;
            }
            const responseData = await response.json();

            if (Object.keys(responseData).length) {
                Setinvoice(responseData.data);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    useEffect(() => {
        setCurrentStatus(invoice?.order_status)
    }, [invoice?.order_status])

    const fetchTemplate = async () => {
        const response = await fetch('/html/invoice.html');
        return response.text();
    };

    // Function to replace placeholders with actual data
    const populateTemplate = (template, data) => {
        return template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
    };

    const handleGenerateBillClick = async () => {
        const template = await fetchTemplate();

        // Prepare dynamic data
        const data = {
            invoice_id: invoice.invoice_id,
            order_status: invoice.order_status === 1 ? 'Paid' : invoice.order_status === 2 ? 'Pending' : 'Overdue',
            assisted_by: `${invoice.assisted_by_first_name} ${invoice.assisted_by_last_name}`,
            from_phone: invoice.phone,
            to_name: `${invoice.first_name} ${invoice.last_name}`,
            to_address_line_1: invoice.address_line_1,
            to_address_line_2: invoice.address_line_2,
            to_landmark: invoice.landmark,
            to_district: invoice.district,
            to_state: invoice.state,
            to_country: invoice.country,
            to_pincode: invoice.pincode,
            created_at: new Date(invoice.created_at).toLocaleString(),
            products: invoice.Products.map(product => `
        <tr>
          <td>${product.title}</td>
          <td>${product.model_number}</td>
          <td>${product.quantity}</td>
          <td>${product.retail_price}</td>
          <td>${product.retail_price}</td>
        </tr>`).join(''),
            subtotal: invoice.base_amount || 0,
            discount: invoice.payment_by_giftcard || 0,
            tax: (invoice.tax_amount || 0),
            total: (invoice?.total_amount || 0)

        };
        // Populate the template with dynamic data
        const populatedTemplate = populateTemplate(template, data);
        // Convert HTML content to PDF and download it
        html2pdf().from(populatedTemplate).save();
    };

    const renderTotal = (
        <>
            <StyledTableRow>
                <TableCell colSpan={4} />
                <TableCell sx={{ color: 'text.secondary' }}>
                    <Box sx={{ mt: 2 }} />
                    Base Amount
                </TableCell>
                <TableCell width={120} sx={{ typography: 'subtitle2' }}>
                    <Box sx={{ mt: 2 }} />
                    {invoice?.base_amount || 0}/-
                </TableCell>
            </StyledTableRow>
            <StyledTableRow>
                <TableCell colSpan={4} />
                <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
                <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
                    {invoice?.payment_by_giftcard || 0}/- {/* Assuming discount is stored in payment_by_giftcard */}
                </TableCell>
            </StyledTableRow>
            <StyledTableRow>
                <TableCell colSpan={4} />
                <TableCell sx={{ color: 'text.secondary' }}>Tax ( 18% )</TableCell>
                <TableCell width={120}>
                    {(invoice?.tax_amount)}/- {/* Calculating 18% tax */}
                </TableCell>
            </StyledTableRow>
            <StyledTableRow>
                <TableCell colSpan={4} />
                <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
                <TableCell width={120}>
                    {invoice?.total_amount || 0}/-
                </TableCell>
            </StyledTableRow>
        </>
    );

    const renderList = (
        <TableContainer sx={{ overflow: 'unset', mt: 5, mb: 5 }}>
            <Scrollbar>
                <Table sx={{ minWidth: 960 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}>#</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Product</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Return</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoice?.Products?.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Box sx={{ maxWidth: 560 }}>
                                        <Typography variant="subtitle2">{product.title}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                            Model: {product.model_number}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                            Weight: {product.weight}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.is_returned == 1 ? "IN RETURN" : "NOT IN RETURN"}</TableCell>
                                <TableCell align="right">{product.retail_price}</TableCell>
                                <TableCell align="right">{product.retail_price}</TableCell> {/* Assuming total price equals retail price */}
                            </TableRow>
                        ))}
                        {renderTotal}
                    </TableBody>
                </Table>
            </Scrollbar>
        </TableContainer>
    );


    return (
        <>
            <Card sx={{ pt: 5, px: 5 }}>
                <Box
                    rowGap={5}
                    display="grid"
                    alignItems="center"
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                    }}
                >
                    <Box
                        component="img"
                        alt="logo"
                        src="/logo/Allurance_logo.svg"
                        sx={{ width: 148, height: 48 }}
                    />
                    <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Button variant="contained" onClick={handleGenerateBillClick}>Download PDF</Button>
                        <Select
                            sx={{ width: 148, height: 48 }}
                            value={currentStatus}
                            onChange={handleChangeStatus}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Order Status' }}
                        >
                            <MenuItem value={1}>Ordered</MenuItem>
                            <MenuItem value={2}>In Transit</MenuItem>
                            <MenuItem value={3}>Delivered</MenuItem>
                        </Select>

                        <Label
                            variant="soft"
                            color={
                                (currentStatus === 1 && 'success') ||
                                (currentStatus === 2 && 'warning') ||
                                (currentStatus === 3 && 'error') ||
                                'default'
                            }
                        >
                            {currentStatus === 1 ? 'Paid' : currentStatus === 2 ? 'Pending' : currentStatus === 3 ? 'Paid' : ''}
                        </Label>

                        <Typography variant="h6">{invoice?.invoice_id}</Typography>
                    </Stack>

                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Invoice From
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Assistant ID:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {invoice?.assisted_by || ""}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Assistant name:
                        </Typography>
                        <Stack direction="row" sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                                {invoice?.assisted_by_first_name || ""}
                            </Typography>
                            <Typography variant="body2">
                                {invoice?.assisted_by_last_name || ""}
                            </Typography>
                        </Stack>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Phone:
                        </Typography>
                        <Typography variant="body2">
                            {invoice?.phone || ""}
                        </Typography>
                    </Stack>

                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Invoice To
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Address:
                        </Typography>

                        <Stack sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                {invoice?.address_line_1 || ""}
                            </Typography>
                        </Stack>

                        <Stack sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                {invoice?.address_line_2 || ""}
                            </Typography>
                        </Stack>

                        <Stack sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                {invoice?.landmark || ""}, {invoice?.district || ""}, {invoice?.state || ""}, {invoice?.country || ""} - {invoice?.pincode || ""}
                            </Typography>
                        </Stack>

                        <Stack sx={{ mb: 1 }}>
                            <Typography variant="body2">
                                Phone: {invoice?.phone || ""}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Date Created
                        </Typography>
                        {fDate(invoice?.created_at)}
                    </Stack>
                </Box>
                {renderList}
                {/* <Divider sx={{ mt: 5, borderStyle: 'dashed' }} /> */}
            </Card>
        </>
    );
}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object,
};

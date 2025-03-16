import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import LoadingButton from '@mui/lab/LoadingButton';
import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Image from 'src/components/image';
// import InvoiceToolbar from './manage_request-toolbar';
import * as Yup from 'yup';
import FormProvider, {
    RHFTextField,
    RHFSelect,
    RHFUpload,
} from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@mui/material';
// ----------------------------------------------------------------------
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Lightbox, { useLightBox } from 'src/components/lightbox';
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));
import EcommerceSaleByGender from 'src/sections/overview/e-commerce/ecommerce-sale-by-gender';
// ----------------------------------------------------------------------

export default function InvoiceDetails({ invoice, open, onClose, coupons, giftCardHistory }) {
    const [currentStatus, setCurrentStatus] = useState(invoice?.status);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const handleChangeStatus = useCallback((event) => {
        setCurrentStatus(event.target.value);
    }, []);

    const renderTotal = (
        <>
            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>
                    <Box sx={{ mt: 2 }} />
                    Subtotal
                </TableCell>
                <TableCell width={120} sx={{ typography: 'subtitle2' }}>
                    <Box sx={{ mt: 2 }} />
                    {fCurrency(invoice?.subTotal)}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Shipping</TableCell>
                <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
                    {fCurrency(-invoice?.shipping)}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
                <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
                    {fCurrency(-invoice?.discount)}
                </TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ color: 'text.secondary' }}>Taxes</TableCell>
                <TableCell width={120}>{fCurrency(invoice?.taxes)}</TableCell>
            </StyledTableRow>

            <StyledTableRow>
                <TableCell colSpan={3} />
                <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
                <TableCell width={140} sx={{ typography: 'subtitle1' }}>
                    {fCurrency(invoice?.totalAmount)}
                </TableCell>
            </StyledTableRow>
        </>
    );

    const renderFooter = (
        <Grid container>
            <Grid xs={12} md={9} sx={{ py: 3 }}>
                <Typography variant="subtitle2">NOTES</Typography>

                <Typography variant="body2">
                    We appreciate your business. Should you need us to add VAT or extra notes let us know!
                </Typography>
            </Grid>

            <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
                <Typography variant="subtitle2">Have a Question?</Typography>

                <Typography variant="body2">support@minimals.cc</Typography>
            </Grid>
        </Grid>
    );

    const renderList = (
        <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
            <Scrollbar>
                <Table sx={{ minWidth: 960 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width={40}>No.</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Gift Card Number</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Amount</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Expiry Date</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Redeemed Date</TableCell>
                            <TableCell sx={{ typography: 'subtitle2' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {coupons?.map((coupon, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{coupon?.gift_card_number}</TableCell>
                                <TableCell>{coupon?.amount}</TableCell>
                                <TableCell>{fDate(coupon?.expiry_date)}</TableCell>
                                <TableCell>{coupon?.redeemed_date ? fDate(coupon?.redeemed_date) : "Not redeemed"}</TableCell>

                                <TableCell>{coupon?.status === 0 ? 'Active' : 'Inactive'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Scrollbar>
        </TableContainer>
    );

    const handleRejectClick = () => {
        setOpenRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setOpenRejectDialog(false);
    };

    const CommentSchema = Yup.object().shape({
        company_name: Yup.string().required('Comment is required'),
    });

    const defaultValues = {
        id: invoice?.id || '',
        total_amount: invoice?.total_amount || '',
        company_name: invoice?.company_name || '',
        total_giftcard: invoice?.total_giftcard || '',
        email: invoice?.email || '',
        created_at: invoice?.created_at || '',
        rejection_reason: invoice?.rejection_reason || '',
    };

    const methods = useForm({
        resolver: yupResolver(CommentSchema),
        defaultValues,
    });

    const {
        reset,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const statusOptionsnew = [
        { value: 'option1', label: 'Option1' },
        { value: 'option2', label: 'Option2' },
        { value: 'option3', label: 'Option3' },
        // Add more options as needed
    ];

    const slides = [
        { src: '/assets/images/about/hero.jpg' },
        // Add more images if needed
    ];

    const {
        selected: selectedImage,
        open: openLightbox,
        onOpen: handleOpenLightbox,
        onClose: handleCloseLightbox,
    } = useLightBox(slides);

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
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Gift Card Information
                        </Typography>
                        <FormProvider methods={methods}>
                            <Stack spacing={3}>

                                {/* <RHFTextField
                                    name="id"
                                    label="ID"
                                    value={defaultValues?.id}
                                    disabled
                                /> */}
                                <RHFTextField
                                    name="company_name"
                                    label="Company Name"
                                    value={defaultValues?.company_name}
                                    disabled
                                />
                                <RHFTextField
                                    name="total_giftcard"
                                    label="Total Giftcard"
                                    value={defaultValues?.total_giftcard}
                                    disabled
                                />
                                <RHFTextField
                                    name="total_amount"
                                    label="Total Amount"
                                    value={defaultValues?.total_amount}
                                    disabled
                                />
                                <RHFTextField
                                    name="email"
                                    label="E-mail"
                                    value={defaultValues?.email}
                                    disabled
                                />
                                <RHFTextField
                                    name="created_at"
                                    label="Created on"
                                    value={fDate(defaultValues?.created_at)}
                                    disabled
                                />
                                {defaultValues?.rejection_reason ?
                                    <RHFTextField
                                        name="rejection_reason"
                                        label="Rejection Reason"
                                        value={defaultValues?.rejection_reason}
                                        disabled
                                    />
                                    : ""}
                            </Stack>

                        </FormProvider>
                    </Stack>
                </Box>
                <Lightbox
                    index={selectedImage}
                    slides={slides}
                    open={openLightbox}
                    close={handleCloseLightbox}
                />
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                {renderList}
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                {giftCardHistory.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Gift Card History
                        </Typography>
                        <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
                            <Scrollbar>
                                <Table sx={{ minWidth: 960 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={40}>No.</TableCell>
                                            <TableCell sx={{ typography: 'subtitle2' }}>Customer Name</TableCell>
                                            <TableCell sx={{ typography: 'subtitle2' }}>Email</TableCell>
                                            <TableCell sx={{ typography: 'subtitle2' }}>Phone</TableCell>
                                            <TableCell sx={{ typography: 'subtitle2' }}>Redeemed Date</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {giftCardHistory?.map((gc, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{gc?.first_name} {gc?.last_name}</TableCell>
                                                <TableCell>{gc?.email}</TableCell>
                                                <TableCell>{gc?.phone}</TableCell>
                                                <TableCell>{fDate(gc?.applied_on)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>
                        <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                    </>
                )}
            </Card >

            <Dialog
                fullWidth
                maxWidth={false}
                // open={open}
                // onClose={onClose}
                open={openRejectDialog}  // Use the state variable to conditionally open/close the dialog
                onClose={handleCloseRejectDialog}

                PaperProps={{
                    sx: { maxWidth: 720 },
                }}
            >
                <FormProvider methods={methods} >
                    <DialogTitle>Quick Update</DialogTitle>

                    <DialogContent>


                        <Box

                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                sm: 'repeat(1, 1fr)',
                            }}
                        >


                            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

                            <RHFTextField name="reason" label="Write reason ..." />




                        </Box>
                    </DialogContent>

                    <DialogActions>
                        {/* <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button> */}

                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            Add
                        </LoadingButton>
                    </DialogActions>
                </FormProvider>
            </Dialog>
        </>
    );


}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
};

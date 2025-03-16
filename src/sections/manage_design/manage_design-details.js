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
import LoadingButton from '@mui/lab/LoadingButton';
import Image from 'src/components/image';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import EcommerceSaleByGender from '../../sections/overview/e-commerce/ecommerce-sale-by-gender';
import { fDate } from 'src/utils/format-time';
const governmentBasePath = '/assets/images/documents/government/';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '& td': {
        textAlign: 'right',
        borderBottom: 'none',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export default function InvoiceDetails({ invoice }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [openLightbox, setOpenLightbox] = useState(false);

    const handleOpenLightbox = (image) => {
        setSelectedImage(image);
        setOpenLightbox(true);
    };

    const handleCloseLightbox = () => {
        setSelectedImage(null);
        setOpenLightbox(false);
    };

    return (
        <>
            <Card sx={{ pt: 5, px: 5, py: 5 }}>
                <Box rowGap={5} display="grid" alignItems="center" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Design Information
                        </Typography>
                        <Stack spacing={3}>
                            {invoice?.model_number ? <Typography variant="subtitle2">Model Number: {invoice?.model_number}</Typography> : ""}
                            <Typography variant="subtitle2">SKU: {invoice?.title}</Typography>
                            <Typography variant="subtitle2">Category: {invoice?.category_name}</Typography>
                            <Typography variant="subtitle2">In Pair: {invoice?.in_pair}</Typography>
                            <Typography variant="subtitle2">Created on: {fDate(invoice?.created_at)}</Typography>
                            {invoice?.updated_at && invoice.record_status == 2 ? <Typography variant="subtitle2">Approved On: {fDate(invoice?.updated_at)}</Typography> : ""}
                            {invoice?.rejection_reason ? <Typography variant="subtitle2">Rejection Reason: {invoice?.rejection_reason}</Typography> : ""}
                        </Stack>
                    </Stack>
                    <Stack sx={{ typography: 'body2' }}>
                        <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                            Uploaded Images
                        </Typography>
                        <Box display="flex">
                            {[
                                invoice?.image1,
                                invoice?.image2,
                                invoice?.image3,
                                invoice?.image4,
                                invoice?.image5,
                                invoice?.image6
                            ].filter(image => image).length > 0 ? (
                                [invoice?.image1, invoice?.image2, invoice?.image3, invoice?.image4, invoice?.image5, invoice?.image6]
                                    .filter(image => image)
                                    .map((image, index) => (
                                        <Image
                                            key={index}
                                            alt={`Image ${index + 1}`}
                                            src={image}
                                            style={{ width: 100, height: 100, marginRight: 2, marginBottom: 2 }}
                                            onClick={() => handleOpenLightbox(image)}
                                        />
                                    ))
                            ) : (
                                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                                    No images uploaded
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Box>
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                {invoice?.marketing_information?.map((info) => (
                    <>
                        <Box rowGap={5} display="grid" alignItems="center" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}>
                            <Stack sx={{ typography: 'body2' }}>
                                <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                                    Marketing Information
                                </Typography>
                                <Stack spacing={3}>
                                    <Typography variant="subtitle2">Title: {info?.title}</Typography>
                                    <Typography variant="subtitle2">Base Price: {info?.base_price}</Typography>
                                    <Typography variant="subtitle2">Bulk Price: {info?.bulk_price}</Typography>
                                    <Typography variant="subtitle2">Collection: {info?.collection}</Typography>
                                    <Typography variant="subtitle2">Weight: {info?.weight}</Typography>
                                    <Typography variant="subtitle2">Description: {info?.description}</Typography>
                                    <Typography variant="subtitle2">Similar Options: {info?.similar_options}</Typography>
                                    <Typography variant="subtitle2">Created on: {fDate(info?.created_at)}</Typography>
                                    {info?.updated_at ? <Typography variant="subtitle2">Approved On: {fDate(info?.updated_at)}</Typography> : ""}
                                    {info?.rejection_reason ? <Typography variant="subtitle2">Rejection Reason: {info?.rejection_reason}</Typography> : ""}
                                </Stack>
                            </Stack>
                            {/* <Stack sx={{ typography: 'body2' }}>
                                <Typography variant="subtitle2" sx={{ mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                                    Uploaded Images
                                </Typography>
                                <Box display="flex">
                                    {[
                                        invoice?.image1,
                                        invoice?.image2,
                                        invoice?.image3,
                                        invoice?.image4,
                                        invoice?.image5,
                                        invoice?.image6
                                    ].filter(image => image).length > 0 ? (
                                        [invoice?.image1, invoice?.image2, invoice?.image3, invoice?.image4, invoice?.image5, invoice?.image6]
                                            .filter(image => image)
                                            .map((image, index) => (
                                                <Image
                                                    key={index}
                                                    alt={`Image ${index + 1}`}
                                                    src={image}
                                                    style={{ width: 100, height: 100, marginRight: 2, marginBottom: 2 }}
                                                    onClick={() => handleOpenLightbox(image)}
                                                />
                                            ))
                                    ) : (
                                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                                            No images uploaded
                                        </Typography>
                                    )}
                                </Box>
                            </Stack> */}
                        </Box>
                        <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                    </>
                ))}
                <Stack sx={{ typography: 'body2' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Pieces Information Pie Chart
                    </Typography>
                    <EcommerceSaleByGender
                        title=""
                        total={2324}
                        chart={{
                            series: [
                                { label: 'Total', value: 44 },
                                { label: 'Online Channel', value: 75 },
                                { label: 'Offline Channel', value: 85 },
                                { label: 'Stock', value: 144 },
                            ],
                        }}
                    />
                </Stack>
                <Divider sx={{ mt: 2, mb: 5, borderStyle: 'dashed' }} />
                <Stack sx={{ mt: 5, typography: 'body2' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mb: 3, fontSize: 'calc(1rem + 1px)' }}>
                        Marketing Channel Information
                    </Typography>
                    <Stack spacing={3}>
                        <Typography variant="subtitle2">Product Name: {invoice?.title}</Typography>
                        {/* <Typography variant="subtitle2">Description: {invoice?.title}</Typography> */}
                        {/* <Typography variant="subtitle2">Retail Price / Bulk Price: 000</Typography> */}
                    </Stack>
                </Stack>
            </Card >
            {/* <Lightbox index={selectedImage} slides={[...Array(6)].map((_, index) => ({ src: invoice[`image${index + 1}`] }))} open={openLightbox} close={handleCloseLightbox} /> */}
        </>
    );
}

InvoiceDetails.propTypes = {
    invoice: PropTypes.object.isRequired,
};

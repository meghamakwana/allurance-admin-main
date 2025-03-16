import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Container } from "@mui/system";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from 'src/components/settings';
import { fTime, fDate } from 'src/utils/format-time';

export default function AccountWishlist({data}) {
    const settings = useSettingsContext();
    return(
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product name</TableCell>
                                    <TableCell>Model number</TableCell>
                                    <TableCell>Sub model number</TableCell>
                                    <TableCell>Shape</TableCell>
                                    <TableCell>Resin</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Bezel material</TableCell>
                                    <TableCell>Inner material name</TableCell>
                                    <TableCell>Flower name</TableCell>
                                    <TableCell>Bezel color</TableCell>
                                    <TableCell>Color</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Discounted price</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell>Sell stock</TableCell>
                                    <TableCell>Coming soon</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created at</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.product_name}</TableCell>
                                        <TableCell>{d.model_number}</TableCell>
                                        <TableCell>{d.sub_model_number}</TableCell>
                                        <TableCell>{d.shape}</TableCell>
                                        <TableCell>{d.resin}</TableCell>
                                        <TableCell>{d.category}</TableCell>
                                        <TableCell>{d.bezel_material}</TableCell>
                                        <TableCell>{d.inner_material_name}</TableCell>
                                        <TableCell>{d.flower_name}</TableCell>
                                        <TableCell>{d.bezel_color}</TableCell>
                                        <TableCell>{d.color}</TableCell>
                                        <TableCell>{d.price}</TableCell>
                                        <TableCell>{d.discount_price}</TableCell>
                                        <TableCell>{d.stock}</TableCell>
                                        <TableCell>{d.sell_stock}</TableCell>
                                        <TableCell>{d.coming_soon}</TableCell>
                                        <TableCell>{d.status}</TableCell>
                                        <TableCell>{fDate(d.created_at)} {fTime(d.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>
            </Container>
        </>
    )
}
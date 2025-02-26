import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Container } from "@mui/system";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from 'src/components/settings';
import { fTime, fDate } from 'src/utils/format-time';

export default function AccountGiftCards({data}) {
    const settings = useSettingsContext();
    return(
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>giftcard id</TableCell>
                                    <TableCell>created by</TableCell>
                                    <TableCell>Created at</TableCell>
                                    <TableCell>deleted by</TableCell>
                                    <TableCell>deleted at</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>gift card number</TableCell>
                                    <TableCell>pin number</TableCell>
                                    <TableCell>expiry date</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.giftcard_id}</TableCell>
                                        <TableCell>{d.created_by}</TableCell>
                                        <TableCell>{fDate(d.created_at)} {fTime(d.created_at)}</TableCell>
                                        <TableCell>{d.deleted_by}</TableCell>
                                        <TableCell>{fDate(d.deleted_at)} {fTime(d.deleted_at)}</TableCell>
                                        <TableCell>{d.amount}</TableCell>
                                        <TableCell>{d.gift_card_number}</TableCell>
                                        <TableCell>{d.pin_number}</TableCell>
                                        <TableCell>{fDate(d.expiry_date)}</TableCell>
                                        <TableCell>{d.status}</TableCell>
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
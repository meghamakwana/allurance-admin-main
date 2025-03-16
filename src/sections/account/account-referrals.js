import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Container } from "@mui/system";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from 'src/components/settings';
import { fTime, fDate } from 'src/utils/format-time';

export default function AccountReferrals({data}) {
    const settings = useSettingsContext();
    return(
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created at</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.fname} {d.lname}</TableCell>
                                        <TableCell>{d.email}</TableCell>
                                        <TableCell>{d.amount}</TableCell>
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
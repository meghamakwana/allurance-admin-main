import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Container } from "@mui/system";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from 'src/components/settings';
import { fTime, fDate } from 'src/utils/format-time';

export default function AccountTickets({data}) {
    const settings = useSettingsContext();
    return(
        <>
            <Container maxWidth={settings.themeStretch ? false : 'lg'}>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ticket id</TableCell>
                                    <TableCell>name</TableCell>
                                    <TableCell>title</TableCell>
                                    <TableCell>subject name</TableCell>
                                    <TableCell>description</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created at</TableCell>
                                    <TableCell>assign by</TableCell>
                                    <TableCell>operate by</TableCell>
                                    <TableCell>closed by</TableCell>
                                    <TableCell>closed date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.ticket_id}</TableCell>
                                        <TableCell>{d.user_first_name} {d.user_last_name}</TableCell>
                                        <TableCell>{d.title}</TableCell>
                                        <TableCell>{d.subject_name}</TableCell>
                                        <TableCell>{d.description}</TableCell>
                                        <TableCell>{d.status}</TableCell>
                                        <TableCell>{fDate(d.created_at)} {fTime(d.created_at)}</TableCell>
                                        <TableCell>{d.assign_by}</TableCell>
                                        <TableCell>{d.operate_by}</TableCell>
                                        <TableCell>{d.closed_by}</TableCell>
                                        <TableCell>{fDate(d.closed_date)} {fTime(d.closed_date)}</TableCell>
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
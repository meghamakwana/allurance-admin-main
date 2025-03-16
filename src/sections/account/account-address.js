import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Container } from "@mui/system";
import Scrollbar from "src/components/scrollbar";
import { useSettingsContext } from 'src/components/settings';

export default function AccountAddress({data}) {
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
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Landmark</TableCell>
                                    <TableCell>District</TableCell>
                                    <TableCell>State</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>Pincode</TableCell>
                                    <TableCell>Default Address</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.first_name} {d.last_name}</TableCell>
                                        <TableCell>{d.email}</TableCell>
                                        <TableCell>{d.phone}</TableCell>
                                        <TableCell>{d.address_1} {d.address_2}</TableCell>
                                        <TableCell>{d.landmark}</TableCell>
                                        <TableCell>{d.district}</TableCell>
                                        <TableCell>{d.state}</TableCell>
                                        <TableCell>{d.country}</TableCell>
                                        <TableCell>{d.pincode}</TableCell>
                                        <TableCell>{d.is_default === 1 ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{d.status === 1 ? 'Active' : 'Inactive'}</TableCell>
                                        <TableCell>{d.a_type}</TableCell>
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
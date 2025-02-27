'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import InvoiceDetails from '../gift-card-details';
import { useEffect, useState } from 'react';
import { ManageAPIsData, ManageAPIsDataWithHeader } from 'src/utils/commonFunction';
import { GIFT_CARD_COUPONS_ENDPOINT, GIFT_CARD_ENDPOINT } from 'src/utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id }) {
    const settings = useSettingsContext();
    const [fetchedData, setFetchedData] = useState(null);
    const [coupons, setCoupons] = useState(null);
    const [giftCardHistory, setGiftCardHistory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {

                const apiUrl = `${GIFT_CARD_ENDPOINT}?type=1&id=${id}`;
                // const response = await ManageAPIsData(apiUrl, 'GET');
                const token = await sessionStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is undefined.");
                    return;
                }
                let data = {};
                data.headers = { Authorization: `Bearer ${token}` }
                const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (Object.keys(responseData).length) {
                    setFetchedData(responseData.data);
                    if (responseData?.data) {
                        FetchGeneratedTemplates(responseData?.data?.id)
                        FetchGiftCardHistory(responseData?.data?.id)
                    }

                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [id]);

    // FUNCTION TO FETH COUPONS DATA 
    async function FetchGeneratedTemplates(id) {
        try {
            const apiUrl = `${GIFT_CARD_COUPONS_ENDPOINT}/${id}`;
            const response = await ManageAPIsData(apiUrl, 'GET');
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
           
            setCoupons(responseData.data || []);
        }
        catch (error) {
            console.error("errror ", error);
        }
    }

    async function FetchGiftCardHistory(id) {
        try {
            const apiUrl = `${GIFT_CARD_ENDPOINT}?id=${id}`;
            const response = await ManageAPIsData(apiUrl, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            
            setGiftCardHistory(responseData.data?.giftCardHistory)
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };



    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading={`View`}
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Multiple for Business',
                        href: paths.dashboard.gift_card.root,
                    },
                    { name: `View` },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <InvoiceDetails invoice={fetchedData} coupons={coupons} giftCardHistory={giftCardHistory} />
        </Container>
    );
}

InvoiceDetailsView.propTypes = {
    id: PropTypes.string,
};

'use client';

import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userAbout, _userPlans, _userPayment, _userInvoices, _userAddressBook } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AccountGeneral from '../account-general';
import AccountBilling from '../account-billing';
import AccountSocialLinks from '../account-social-links';
import AccountNotifications from '../account-notifications';
import AccountChangePassword from '../account-change-password';
import AccountActivityLog from '../account-activity-log';
import AccountOrderList from '../../order/view/order-list-view';
import AccountOrderDetail from '../../order/view/order-details-view';
import AccountAddress from '../account-address';
import AccountCart from '../account-cart';
import AccountWishlist from '../account-wishlist';
import AccountReferrals from '../account-referrals';
import AccountGiftCards from '../account-gift-cards';
import AccountTickets from '../account-tickets';

import { CUSTOMER_DETAILS_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'orders',
    label: 'Orders',  
    icon: <Iconify icon="solar:list-bold" width={24} />,
  },
  // {
  //   value: 'activitylog',
  //   label: 'Activity Log',
  //   icon: <Iconify icon="solar:list-bold" width={24} />,
  // },
  {
    value: 'address',
    label: 'Addresses',
    icon: <Iconify icon="typcn:home-outline" width={24} />,
  },
  {
    value: 'cart',
    label: 'Cart',
    icon: <Iconify icon="typcn:shopping-cart" width={24} />,
  },
  {
    value: 'wishlist',
    label: 'Wishlist',
    icon: <Iconify icon="typcn:heart-outline" width={24} />,
  },
  {
    value: 'referrals',
    label: 'Referrals',
    icon: <Iconify icon="heroicons:currency-rupee" width={24} />,
  },
  {
    value: 'giftcards',
    label: 'Gift Cards',
    icon: <Iconify icon="typcn:gift" width={24} />,
  },
  {
    value: 'tickets',
    label: 'Tickets',
    icon: <Iconify icon="typcn:ticket" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function UsersAccountView({ id }) {

  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const apiUrl = `${CUSTOMER_DETAILS_ENDPOINT}?id=${id}`;
            const response = await ManageAPIsData(apiUrl, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            setData(responseData.data)
            setCurrentTab('general');
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    fetchData();
  }, [id]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Manage Customer', href: paths.dashboard.user.root },
          { name: 'Customer List', href: paths.dashboard.user.root },
          { name: 'View Customer' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral id={id} data={data} />}

      {currentTab === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )}

      {currentTab === 'notifications' && <AccountNotifications id={id} />}

      {currentTab === 'social' && <AccountSocialLinks id={id} socialLinks={_userAbout.socialLinks} />}

      {currentTab === 'security' && <AccountChangePassword id={id} />}

      {currentTab === 'activitylog' && (
        <AccountActivityLog
          id={id}
          invoices={_userInvoices}
        />
      )}

      {currentTab === 'orders' && <AccountOrderList data={data?.orderResults} /> || currentTab === 'orders' && <AccountOrderDetail id={id} />}

      {currentTab === 'address' && <AccountAddress data={data?.addressResult} />}

      {currentTab === 'cart' && <AccountCart data={data?.cartResults} />}

      {currentTab === 'wishlist' && <AccountWishlist data={data?.wishlistResults} />}

      {currentTab === 'referrals' && <AccountReferrals data={data?.referalResults} />}

      {currentTab === 'giftcards' && <AccountGiftCards data={data?.giftCardResult} />}

      {currentTab === 'tickets' && <AccountTickets data={data?.ticketResults} />}
    </Container>
  );
}

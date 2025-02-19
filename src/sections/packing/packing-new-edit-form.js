import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete, RHFUpload } from 'src/components/hook-form';

import { ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import {
  PACKERS_MANAGER_BOXPACK_ADD,
  PACKERS_MANAGER_BOXPACK_VERIFYREQUEST,
  PACKERS_QUALITY_SERIAL_ON_BATCH,
  PACKERS_VERIFY_SERIAL_NUMBER,
  PACKING_UPDATE_SERIAL_NUMBER,
  PAKING_SERIAL_ON_BATCH,
} from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { gridFilterActiveItemsLookupSelector } from '@mui/x-data-grid';
import { Box } from '@mui/system';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
const CSV_HEADER = [
  'Batch Number',
  'Qulity Check Number',
  'Model Number',
  'Category',
  'Serial Number',
  'Metal Name',
];

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [showFirstForm, setshowFirstForm] = useState(true);
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [authKey, setAuthKey] = useState(null);
  const [ProductId, SetProductId] = useState(null);
  const [lockedBatchNumber, setLockedBatchNumber] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [srNoBasedOnBatch, setSrNoBasedOnBatch] = useState([]);
  const [secondListData, setSecondListData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    batch_number: Yup.string().required('Batch Number is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const batchNumberValue = methods.watch('batch_number');
  const serialNumberValue = methods.watch('serial_number');

  const backToFirstForm = () => {
    setShowSecondForm(false);
    setshowFirstForm(true);
    setSerialNumbers([]);
    setSrNoBasedOnBatch([]);
    setSecondListData([]);
    methods.reset();
  };

  const addSerialNumber = async () => {
    const serialNumber = methods.getValues('serial_number');
    if (!serialNumber) {
      enqueueSnackbar('Please enter a serial number.', { variant: 'warning' });
      return;
    }

    const payload = { serial_number: serialNumber };

    try {
      const apiUrl = `${PACKERS_VERIFY_SERIAL_NUMBER}`;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok && responseData.status) {
        const matchedSerialNumber = responseData.matched_serial_number;

        const isDuplicate = serialNumbers.some(
          (item) => item.serial_number === matchedSerialNumber
        );
        if (!isDuplicate) {
          setSerialNumbers((prevSerialNumbers) => [
            ...prevSerialNumbers,
            { serial_number: matchedSerialNumber },
          ]);
          enqueueSnackbar(responseData.message || 'Serial number added successfully.', {
            variant: 'success',
          });

          
        } else {
          enqueueSnackbar('This serial number is already added.', { variant: 'warning' });
        }

        setSecondListData(responseData.data);
      } else {
        enqueueSnackbar(responseData.message || 'Failed to submit request IDs.', {
          variant: 'error',
        });
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Unknown error', { variant: 'error' });
    }
  };

  const removeSerialNumber = (index) => {
    const updatedSerialNumbers = [...serialNumbers];
    updatedSerialNumbers.splice(index, 1);
    setSerialNumbers(updatedSerialNumbers);
  };

  const downloadCSV = (data) => {
    const csvContent = [
      CSV_HEADER.join(','),
      ...data.map((item) =>
        [
          item.batch_number,
          `="${item.quality_checked_number}"`,
          item.model_number,
          item.category_name,
          `="${item.serial_number}"`,
          item.metal_name,
        ].join(',')
      ),
    ];
    const csvData = csvContent.join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Product_box.csv');
    document.body.appendChild(link);
    link.click();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const apiUrl = `${PAKING_SERIAL_ON_BATCH}`;
      const fetchMethod = 'POST';
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }
      data.headers = { Authorization: `Bearer ${token}` };
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      const responseData = await response.json();
      const serialNumbersFormatted = responseData.data;

      serialNumbersFormatted?.forEach((newItem) => {
        const isDuplicate = serialNumbers.some(
          (item) => item.batch_number === newItem.batch_number
        );

        if (!isDuplicate) {
          setSerialNumbers((prevSerialNumbers) => [...prevSerialNumbers, newItem]);
        }
      });

      if (responseData.status) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
        resetFirstForm({ batch_number: '' });
      } else {
        enqueueSnackbar(responseData.message, { variant: 'error' });
      }
    } catch (error) {
      console.log(error, 'ERROR');
    }
  });

  const submitRequestIds = async () => {
    const requestIds = serialNumbers.map((item) => item.serial_number);

    const payload = { serial_numbers: requestIds };

    try {
      const apiUrl = `${PACKING_UPDATE_SERIAL_NUMBER}`;
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error('Token is undefined.');
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSecondListData(responseData.data);
        enqueueSnackbar('Request IDs successfully submitted.', { variant: 'success' });
        setshowFirstForm(false);
        setShowSecondForm(true);
        methods.setValue('serial_number', '');
      } else {
        enqueueSnackbar(responseData.message || 'Failed to submit request IDs.', {
          variant: 'error',
        });
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Unknown error', { variant: 'error' });
    }
  };

  return (
    <Grid container spacing={3}>
      {showFirstForm && (
        <Grid item xs={12}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <RHFTextField
                  fullWidth
                  type="text"
                  name="batch_number"
                  id="batch_number"
                  label="Batch Number"
                  disabled={!!serialNumberValue}
                />
                <Button sx={{ mt: 1, ml: 1 }} variant="contained" type="submit">
                  Fetch Serial Number
                </Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                <RHFTextField
                  fullWidth
                  type="text"
                  name="serial_number"
                  id="serial_number"
                  inputProps={{ maxLength: 20 }}
                  label="Full Serial Number"
                  disabled={!!batchNumberValue}
                />
                {(methods.watch('serial_number') || methods.watch('serial_number2')) && (
                  <Button sx={{ mt: 1 }} variant="contained" onClick={addSerialNumber}>
                    <Iconify icon="ph:plus-fill" style={{ marginRight: 8 }} />
                    Add Serial Number
                  </Button>
                )}
              </Box>
              {serialNumbers?.length > 0 && (
                <>
                  <TableContainer sx={{ mt: 2, mb: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Delete</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {serialNumbers?.map((item, index) => (
                          <TableRow key={index + 1}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.serial_number}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => removeSerialNumber(index)}>
                                <Iconify
                                  icon="material-symbols:delete-sharp"
                                  style={{ color: 'red' }}
                                />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: 2 }}>
                    <LoadingButton
                      type="button"
                      size="large"
                      variant="contained"
                      loading={isSubmitting}
                      onClick={submitRequestIds}
                    >
                      Submit
                    </LoadingButton>
                  </Box>
                </>
              )}
            </Card>
          </FormProvider>
        </Grid>
      )}
      {showSecondForm && (
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => downloadCSV(secondListData)}
                style={{ float: 'right', marginBottom: '20px' }}
              >
                Download CSV
              </Button>

              <Typography onClick={() => backToFirstForm()} style={{ cursor: 'pointer' }}>
                Back
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Batch Number</TableCell>
                      <TableCell>Authenticity Card Number</TableCell>
                      <TableCell>Model Number</TableCell>
                      <TableCell>Category Name</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Metal Name</TableCell>
                      <TableCell>Box Id</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {secondListData &&
                      secondListData?.map((p, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{p.batch_number}</TableCell>
                          <TableCell>{p.quality_checked_number}</TableCell>
                          <TableCell>{p.model_number}</TableCell>
                          <TableCell>{p.category_name}</TableCell>
                          <TableCell>{p.serial_number}</TableCell>
                          <TableCell>{p.metal_name}</TableCell>
                          <TableCell>{p.box_id}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};

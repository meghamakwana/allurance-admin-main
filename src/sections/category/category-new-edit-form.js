// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
// import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

// import {
//   _tags,
// } from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader, createImageOption, createImageOptions } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT } from '../../utils/apiEndPoints';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { gridFilterActiveItemsLookupSelector } from '@mui/x-data-grid';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');
  const [stateImage1Option, setImage1Option] = useState(false);
  const [stateImage2Option, setImage2Option] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    code: Yup.string().required('Code is required'),
    pair: Yup.string().required('Pair is required'),
    hsn: Yup.string().required('HSN is required'),
    gstPercentage: Yup.string().required('GST Percentage is required'),
  });

  const categoriesBasePath = '/assets/images/categories/';

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      code: currentProduct?.code || '',
      pair: currentProduct?.pair || '',
      description: currentProduct?.description || '',
      image1: currentProduct?.image1 || null,
      image2: currentProduct?.image2 || null,
      hsn: currentProduct?.hsn || '',
      gstPercentage: currentProduct?.gstPercentage || '',
    }),
    [currentProduct]
  );

  const pairs = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  // const [error, setError] = useState("");

  const mapPairLabelToValue = (label) => {
    const pairOption = pairs.find((option) => option.label === label);
    return pairOption ? pairOption.value : null;
  };

  // HandleImage - While submit time
  const handleImage = async (data, imageKey, stateImageOption) => {
    const image = data[imageKey];
    if (image && Object.keys(image).length) {
      if (typeof image === 'string' && image.includes(categoriesBasePath)) {
        data[imageKey] = image.replace(categoriesBasePath, '');
      }
      if (stateImageOption) {
        // data[imageKey].imgData = await createImageOptions(data, imageKey);
        data[imageKey] = await createImageOptions(image);
      }
    }
  };

  async function FetchDetails() {
    const STORAGE_KEY = 'accessToken';
    const user = await FetchUserDetail();
    const accessToken = await sessionStorage.getItem(STORAGE_KEY);
    const decoded = await jwtDecode(accessToken);
  }

  useEffect(() => {
    FetchDetails()
  }, [])

  // Manage Add or Update
  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     const token = await sessionStorage.getItem('accessToken');
  //     if (!token) {
  //       console.error("Token is undefined.");
  //       return;
  //     }
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     reset();
  //     // Handle Image Process
  //     const imageKeys = ['image1', 'image2'];
  //     for (const imageKey of imageKeys) {
  //       await handleImage(data, imageKey, eval(`state${imageKey.charAt(0).toUpperCase() + imageKey.slice(1)}Option`));
  //     }
  //     const mappedData = {
  //       ...data,
  //       pair: mapPairLabelToValue(data.pair),
  //     };
  //     const user = await FetchUserDetail();
  //     mappedData.apihitid = user.id
  //     const apiUrl = currentProduct ? `${CATEGORY_ENDPOINT}?id=${currentProduct.id}` : CATEGORY_ENDPOINT;
  //     const fetchMethod = currentProduct ? "PUT" : "POST";
  //     mappedData.headers = { Authorization: `Bearer ${token}` }
  //     const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, mappedData);
  //     if (response.ok) {
  //       enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
  //       router.push(paths.dashboard.category.root);
  //     } else {
  //       const responseData = await response.json();
  //       // Check if the response contains an error message
  //       if (responseData && responseData.error) {
  //         // Display the error message to the user, for example, using a notification library
  //         enqueueSnackbar(responseData.error, { variant: 'error' });
  //       }
  //     }

  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const user = await FetchUserDetail();

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('code', data.code);
      formData.append('pair', data.pair || 'No');
      formData.append('apihitid', user.id);
      formData.append('hsn', data.hsn);
      formData.append('gstPercentage', data.gstPercentage);
      console.log('formData', formData);


      // Append image files
      const imageKeys = ['image1', 'image2'];
      for (const imageKey of imageKeys) {
        const file = data[imageKey];
        if (file) {
          formData.append(imageKey, file); // Ensure `file` is a valid File object
        }
      }

      
      const apiUrl = currentProduct ? `${CATEGORY_ENDPOINT}?id=${currentProduct.id}` : CATEGORY_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const response = await fetch(apiUrl, {
        method: fetchMethod,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.category.root);
      } else {
        const responseData = await response.json();
        console.error('Error from server:', responseData.error);
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });


  // // Image Handler Removed
  // const createImageHandler = (imageKey, setOption) => useCallback(
  //   (acceptedFiles) => {
  //     const file = acceptedFiles[0];

  //     const newFile = file && Object.assign(file, {
  //       preview: URL.createObjectURL(file),
  //     });

  //     setValue(imageKey, newFile, { shouldValidate: true });
  //     setOption(true);
  //   },
  //   [setValue, setOption]
  // );

  // const createRemoveFileHandler = (imageKey) => useCallback(() => {
  //   setValue(imageKey, null);
  // }, [setValue]);

  // useEffect(() => {
  //   if (currentProduct) {
  //     setValue('image1', currentProduct ? currentProduct.image1 : null);
  //     setValue('image2', currentProduct ? currentProduct.image2 : null);
  //   }
  // }, [currentProduct, setValue]);

  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>


            <RHFTextField id="name" name="name" label="Title" />
            <RHFTextField id="code" name="code" label="Code" />

            <RHFAutocomplete
              name="pair"
              id="pair"
              type="pair"
              label="Pair"
              placeholder="Choose a pair"
              fullWidth
              options={pairs.map((option) => option.label)}
              getOptionLabel={(option) => option}
            />

            <RHFTextField id="hsn" name="hsn" label="HSN" />
            <RHFTextField id="gstPercentage" name="gstPercentage" label="Gst Percentage" />

            {/* <RHFUpload
              name="image1"
              maxSize={3145728}
              onDrop={createImageHandler('image1', setImage1Option)}
              onDelete={createRemoveFileHandler('image1')}
            />

            <RHFUpload
              name="image2"
              maxSize={3145728}
              onDrop={createImageHandler('image2', setImage2Option)}
              onDelete={createRemoveFileHandler('image2')}
            /> */}


            {/* <RHFSelect
              fullWidth
              name="pair"
              label="Pair"
              InputLabelProps={{ shrink: true }}
              defaultValue="Select Pair"
            >
              {['Yes', 'No'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </RHFSelect> */}



          </Stack>
        </Card>
      </Grid>

      {/* {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, Description
          </Typography>
        </Grid>
      )} */}
    </>
  );

  const renderActions = (
    <>
      {/* {mdUp && <Grid md={4} />} */}
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
      {/* <div className="error">
        {error && <span className="error_message">{error}</span>}
      </div> */}
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>

  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};

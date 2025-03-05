// src/sections/product/product-new-edit-form.js
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
// import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import "../../../../public/uploadcss/index.css"
// import FormControlLabel from '@mui/material/FormControlLabel';
import Papa from 'papaparse';
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
} from 'src/components/hook-form';
// import axios from 'axios';
// import MenuItem from '@mui/material/MenuItem';

import { ManageAPIsData, ManageAPIsDataWithHeader, FetchUserDetail } from '../../../utils/commonFunction';
import { GIFT_CARD_ENDPOINT } from '../../../utils/apiEndPoints';
import { Button, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { GridDeleteIcon } from '@mui/x-data-grid';
import { Box } from '@mui/system';
import Upload from 'src/components/upload/upload';
import Label from 'src/components/label';
import UploadCsv from 'src/components/upload/upload-csv';
import Scrollbar from 'src/components/scrollbar';

// import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const [rows, setRows] = useState([{ id: 0, value: 'default value', multiplication: 'default multiplication' }]);
  const mdUp = useResponsive('up', 'md');
  const [selectedTemplate, setSelectedTemplate] = useState(currentProduct?.choose_template || 0);
  const [UploadedFile, setUploadedFile] = useState({});
  const [CsvData, setCsvData] = useState([]);
  const [Wholefile, setWholefile] = useState({});
  const [UploadedTemplate, setUploadedTemplate] = useState(null);
  const [TemplateData, setTemplateData] = useState(null);


  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    company_name: Yup.string().required('Company name is required'),
    email: Yup.string().required('E-mail is required'),
  });



  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      company_name: currentProduct?.company_name || '',
      email: currentProduct?.email || '',
      description: currentProduct?.description || '',
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
    // watch,
    // setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const values = watch();

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


  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };



  // FUNCTION TO HANDLE TEMPLATE FILE CHANGES
  const handleFileChange = async (event) => {
    const file = event[0];
    setUploadedTemplate(file);
    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: false
    });
    if (errors.length === 0) {
      setTemplateData(data);
    } else {
      alert(`Invalid template file format! Please upload a CSV.`);
    }
  };

  // FUNCTION FOR CSV FILE UPLOAD
  // const HandleCSVFileChange = async (event) => {
  //   const file = event[0];
  //   const text = await file.text();
  //   const { data, errors } = Papa.parse(text, {
  //     header: false
  //   });

  //   if (errors.length === 0) {
  //     setUploadedFile(data);
  //     const extractedData = data?.map(row => ({
  //       name: row[0],    // Assuming name is in the first column
  //       email: row[1],   // Assuming email is in the second column
  //       phone: row[2],   // Assuming phone is in the third column
  //       amount: row[3]   // Assuming amount is in the fourth column
  //     }));

  //     const totalCounts = {
  //       emails: extractedData?.filter(item => item.email).length,
  //       phones: extractedData?.filter(item => item.phone).length,
  //       names: extractedData?.filter(item => item.name).length,
  //       amounts: extractedData?.filter(item => item.amount).length
  //     };

  //     setCsvData(totalCounts);

  //   } else {
  //     // Handle parsing errors
  //     console.error('Error parsing CSV:', errors);
  //   }
  //   // setSelectedFile(event.target.files[0]);
  // };


  const HandleCSVFileChange = async (event) => {
    const file = event[0];

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: false
    });
    setUploadedFile(file);
    if (errors.length === 0) {
      // const extractedData = data.map(row => ({
      //   const extractedData = data.slice(1).map(row => ({
      //   name: row[0],
      //   email: row[1],
      //   phone: row[2],
      //   amount: parseFloat(row[3]) || 0
      // }));

      const extractedData = data
        .slice(1)
        .filter(row => row[0] && row[1])
        .map(row => ({
          name: row[0],
          email: row[1],
          phone: row[2],
          amount: parseFloat(row[3]) || 0
      }));

      const totalCounts = {
        amount: 0
      };

      extractedData.forEach((ed) => {
        totalCounts.amount = totalCounts.amount + ed.amount
      })

      setWholefile(extractedData);
      setCsvData(totalCounts);
    } else {
      console.error('Error parsing CSV:', errors);
    }
  };

  // Manage Add or Update
  const onSubmit = handleSubmit(async (data) => {
    try {

      if (!Wholefile || (Array.isArray(Wholefile) && Wholefile.length === 0) || (Object.keys(Wholefile).length === 0 && Wholefile.constructor === Object)) {
        enqueueSnackbar('Please upload a CSV file.', { variant: 'error' });
        return;
      }

      // Update rows state before constructing the payload
      const denominations = rows.map((row) => ({
        id: row.id,
        value: parseInt(row.value) || null,
        multiplication: parseInt(row.multiplication) || null,
      }));

      const user = await FetchUserDetail();
      
      // Construct the final payload
      const payload = {
        type: 2,
        name: data.name,
        company_name: data.company_name,
        email: data.email,
        description: data.description,
        notes: data.notes,
        choose_template: selectedTemplate,
        csvdata: Wholefile ? Wholefile : [],
        apihitid: user.id,
  
      };

      const apiUrl = currentProduct ? `${GIFT_CARD_ENDPOINT}?id=${currentProduct.id}` : GIFT_CARD_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      payload.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, payload);
      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.people_gift_card.root);
      } else {
        const responseData = await response.json();
        // Check if the response contains an error message
        if (responseData && responseData.error) {
          // Display the error message to the user, for example, using a notification library
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }

    } catch (err) {
      console.error(err.message);
    }
  });

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);

      // Check if currentProduct has choose_template and set the selected template accordingly
      if (currentProduct.choose_template) {
        setSelectedTemplate(currentProduct.choose_template);
      }
    }
  }, [currentProduct, defaultValues, reset]);


  const renderDetails = (
    <>
      <Grid xs={12} md={12}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField id="name" name="name" label="Name" />
            <RHFTextField id="company_name" name="company_name" label="Company name" />
            <RHFTextField id="email" name="email" label="E-mail" />
            <label>Upload CSV</label>
            <Upload onDrop={HandleCSVFileChange} />
            {UploadedFile && (
              <div>
                <p>Uploaded file:  {UploadedFile.name}</p>
              </div>
            )}
            <Typography level="title-md">Select Template</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                  {[1, 2, 3, 4].map((template) => (
                    <Grid item xs={3} key={template}>
                      <Card
                        variant="solid"
                        sx={{
                          bgcolor: 'text.disabled',
                          color: 'white',
                          cursor: 'pointer0',
                          opacity: selectedTemplate === template ? 1 : 0.5,
                        }}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent>
                          <Typography level="title-md">
                            {`Template ${template}`}
                          </Typography>
                          <Typography>{template === 4 ? "Upload custom template" : "Select template"}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {selectedTemplate === 4 && <Grid xs={12}><label>Custom template</label> <Upload onDrop={handleFileChange} />  {UploadedTemplate && (
                <div>
                  <p>Uploaded Template:  {UploadedTemplate.name}</p>
                </div>
              )}</Grid>}
            </Grid>
            <RHFTextField id="description" name="description" label="Notes" />
            <Card variant="solid" sx={{ bgcolor: 'text.disabled', color: 'white', justifyContent: "center", alignItems: "center" }}  >
              <CardContent>
                <Typography level="title-md"> Summary</Typography>
                <Typography marginTop={2} > Total amount : ₹{CsvData.amount ? CsvData.amount : 0}</Typography>
                <Typography marginBottom={2}>  Total Number of Gift Card: {Wholefile?.length ? Wholefile.length : 0}</Typography>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Wholefile?.length && Wholefile?.map((d) => (
                                    <TableRow>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>{d.email}</TableCell>
                                        <TableCell>{d.phone}</TableCell>
                                        <TableCell>{d.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>
              </CardContent>
            </Card>

          </Stack>
        </Card>
      </Grid>
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

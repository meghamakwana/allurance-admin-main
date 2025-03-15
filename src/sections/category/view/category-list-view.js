'use client';


import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {
  DataGrid,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

// import { useGetProducts } from 'src/api/product';
// import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import ProductTableToolbar from '../product-table-toolbar';
import { ManageAPIsData } from '../../../utils/commonFunction';
import { CATEGORY_ENDPOINT, ine_category_ModuleID } from '../../../utils/apiEndPoints';
import ProductTableFiltersResult from '../category-table-filters-result';
import {
  // RenderCellStock,
  // RenderCellPrice,
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
  RenderCellProductCode,
  RenderCellHsn,
  RenderCellGst,
} from '../category-table-row';
import { usePermissions } from 'src/utils/PermissionFunction';


// ----------------------------------------------------------------------

// Define the metadata
export const metadata = {
  title: 'Dashboard: Category List',
};


const PUBLISH_OPTIONS = [
  { value: 1, label: 'Yes' },
  { value: 2, label: 'No' },
];

const defaultFilters = {
  publish: [],
  stock: [],
};

const HIDE_COLUMNS = {
  category: false,
};

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export default function ProductListView(permissions) {
  const { add_access, update_access, delete_access } = permissions.permissions


  const { enqueueSnackbar } = useSnackbar();

  const confirmRows = useBoolean();

  const router = useRouter();

  const settings = useSettingsContext();

  // const { products, productsLoading } = useGetProducts();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  // Listing data
  const getListingData = async () => {
    try {

      const response = await ManageAPIsData(CATEGORY_ENDPOINT, 'GET');

      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  // useEffect(() => {
  //   if (products.length) {
  //     setTableData(products);
  //   }
  // }, [products]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Single record delete
  const handleDeleteRow = useCallback(
    async (id) => {
      try {

        const apiUrl = `${CATEGORY_ENDPOINT}?id=${id}`;
        const response = await ManageAPIsData(apiUrl, 'DELETE');

        if (response.ok) {

          const updatedTableData = tableData.filter((row) => row.id !== id);
          enqueueSnackbar('Delete success!');
          setTableData(updatedTableData);
        } else {
          console.error("Error deleting data3:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting data:4", error);
      }
    },
    [enqueueSnackbar, tableData]
  );


  const handleDeleteRows = useCallback(async () => {
    const deletedIds = selectedRowIds.join(',');
    // const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
    try {

      const apiUrl = `${CATEGORY_ENDPOINT}?ids=${deletedIds}`;
      const response = await ManageAPIsData(apiUrl, 'DELETE');

      if (response.ok) {
        enqueueSnackbar('Delete success!');
        const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
        setTableData(deleteRows);
      } else {
        console.error("Error deleting data:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }, [enqueueSnackbar, selectedRowIds, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.category.edit(id));
    },
    [router]
  );

  // const handleViewRow = useCallback(
  //   (id) => {
  //     router.push(paths.dashboard.product.details(id));
  //   },
  //   [router]
  // );

  const columns = [
    {
      field: 'category',
      headerName: 'Category',
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => <RenderCellProduct params={params} />,
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => <RenderCellProductCode params={params} />,
    },
    {
      field: 'hsn',
      headerName: 'HSN',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => <RenderCellHsn params={params} />,
    },
    {
      field: 'gstPercentage',
      headerName: 'Gst Percentage',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => <RenderCellGst params={params} />,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    // {
    //   field: 'inventoryType',
    //   headerName: 'Stock',
    //   width: 160,
    //   type: 'singleSelect',
    //   valueOptions: PRODUCT_STOCK_OPTIONS,
    //   renderCell: (params) => <RenderCellStock params={params} />,
    // },
    // {
    //   field: 'price',
    //   headerName: 'Price',
    //   width: 140,
    //   editable: true,
    //   renderCell: (params) => <RenderCellPrice params={params} />,
    // },
    {
      field: 'pair',
      headerName: 'Pair',
      width: 110,
      type: 'singleSelect',
      editable: false,
      valueOptions: PUBLISH_OPTIONS,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    // {
    //   type: 'actions',
    //   field: 'actions',
    //   headerName: ' ',
    //   align: 'right',
    //   headerAlign: 'right',
    //   width: 80,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,
    //   getActions: (params) => [
    //     // <GridActionsCellItem
    //     //   showInMenu
    //     //   icon={<Iconify icon="solar:eye-bold" />}
    //     //   label="View"
    //     //   onClick={() => handleViewRow(params.row.id)}
    //     // />,
    //     <GridActionsCellItem
    //       showInMenu
    //       icon={<Iconify icon="solar:pen-bold" />}
    //       label="Edit"
    //       onClick={() => handleEditRow(params.row.id)}
    //     />,
    //     <GridActionsCellItem
    //       showInMenu
    //       icon={<Iconify icon="solar:trash-bin-trash-bold" />}
    //       label="Delete"
    //       onClick={() => {
    //         handleDeleteRow(params.row.id);
    //       }}
    //       sx={{ color: 'error.main' }}
    //     />,
    //   ],
    // },


    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      getActions: (params) => {
        const actions = [];
        // Conditionally render Edit action if user has update access
        {
          update_access === 1 &&
            actions.push(
              <GridActionsCellItem
                key="edit"
                showInMenu
                icon={<Iconify icon="solar:pen-bold" />}
                label="Edit"
                onClick={() => handleEditRow(params.row.id)}
              />
            )
        }


        // Conditionally render Delete action if user has delete access
        {
          delete_access === 1 &&
            actions.push(
              <GridActionsCellItem
                key="delete"
                showInMenu
                icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                label="Delete"
                onClick={() => handleDeleteRow(params.row.id)}
                sx={{ color: 'error.main' }}
              />
            );
        }
        return actions;
      },
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Category',
              href: paths.dashboard.category.root,
            },
            { name: 'List' },
          ]}
          action=
          {add_access === 1 && (
            <Button
              component={RouterLink}
              href={paths.dashboard.category.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add New
            </Button>
          )}
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Card
          sx={{
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={false}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: () => (
                <>
                  <GridToolbarContainer>
                    {/* <ProductTableToolbar
                      filters={filters}
                      onFilters={handleFilters}
                      stockOptions={PRODUCT_STOCK_OPTIONS}
                      publishOptions={PUBLISH_OPTIONS}
                    /> */}

                    <GridToolbarQuickFilter />

                    <Stack
                      spacing={1}
                      flexGrow={1}
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      {!!selectedRowIds.length && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          onClick={confirmRows.onTrue}
                        >
                          Delete ({selectedRowIds.length})
                        </Button>
                      )}

                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarExport />
                    </Stack>
                  </GridToolbarContainer>

                  {canReset && (
                    <ProductTableFiltersResult
                      filters={filters}
                      onFilters={handleFilters}
                      onResetFilters={handleResetFilters}
                      results={dataFiltered.length}
                      sx={{ p: 2.5, pt: 0 }}
                    />
                  )}
                </>
              ),
              noRowsOverlay: () => <EmptyContent title="No Data" />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              columnsPanel: {
                getTogglableColumns,
              },
            }}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}

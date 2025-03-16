'use client';

import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import OrderTableRow from '../reports-table-row';
import OrderTableToolbar from '../reports-table-toolbar';
import OrderTableFiltersResult from '../reports-table-filters-result';
import { REPORTS_LISTING } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

import html2pdf from 'html2pdf.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'batch_number', label: 'Batch Number', align: 'center'  },
  { id: 'model_number', label: 'Model Number', align: 'center' },
  { id: 'category_name', label: 'Category Name', align: 'center' },
  { id: 'rack_name', label: 'Rack Name', align: 'center' },
  { id: 'quantity', label: 'Quantity', align: 'center' },
  { id: 'is_quality_checked_replicator', label: 'Is Quality Checked', align: 'center' },
  { id: 'is_packed_replicator', label: 'Is Packed Replicator', width: 120, align: 'center' },
  { id: '', width: 88 },
  { id: '' },
];

const defaultFilters = {
  batch_number: '',
  status: 'all',
  startDate: null,
  endDate: null,
  model_number: '',
  packing_request_id: '',
};

// ----------------------------------------------------------------------

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState(_orders);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  // const canReset =    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);
  const canReset =
    !!filters.batch_number ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate) ||
    !!filters.packing_request_id ||
    !!filters.model_number;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (batch_number, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [batch_number]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(REPORTS_LISTING, 'GET');

      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }

      const responseData = await response.json();

      if (responseData.data.length) {
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getListingData();
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.reports.details(id));
    },
    [router]
  );

  const handleDownloadReport = () => {
    table.onDefaultRowsPerPageChange(1000);
    const options = {
      filename:     'Warehouse report.pdf',
      jsPDF:        { unit: 'in', format: 'A4', orientation: 'portrait' }
    }
    const el = document.querySelector('#reports-table')
    html2pdf(el, options).then(() => {
      table.onDefaultRowsPerPageChange(5);
    })
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Reports',
              // href: paths.dashboard.reports.root,
            },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          />
          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} 
          <Stack direction="row" justifyContent="end" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
            <Button
              variant="contained"
              onClick={handleDownloadReport}
              size="small"
              sx={{ mb: 2, mr: 4 }}
            >
              Download Report
            </Button>
          </Stack> 
          
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              rowCount={dataFiltered.length}
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table id='reports-table' size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <OrderTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
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
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, startDate, endDate, model_number, packing_request_id, batch_number } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (batch_number) {
    inputData = inputData.filter(
      (order) => order.batch_number?.toLowerCase().indexOf(batch_number.toLowerCase()) !== -1
    );
  }

  if (model_number) {
    const models = model_number.split(',');
    const filteredData = [];
    inputData.forEach((order) => {
      models.forEach((model) => {
        if(model && order.model_number?.toLowerCase().indexOf(model.trim().toLowerCase()) !== -1) {
          filteredData.push(order)
        }
      })
    })
    inputData = filteredData;
  }

  if (packing_request_id) {
    inputData = inputData.filter((order) => {
      const matchingSerials = order.serial_number_data.filter(
        (serial) => serial.packing_request_id === packing_request_id
      );

      if (matchingSerials.length > 0) {
        order.serial_number_data = matchingSerials;
        return true;
      }

      return false;
    });
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) => isBetween(order.createdAt, startDate, endDate));
    }
  }

  return inputData;
}

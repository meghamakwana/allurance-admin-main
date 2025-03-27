'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button } from '@mui/material';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';

import Editor from 'src/components/editor';
import Iconify from 'src/components/iconify';
import { useState } from 'react';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { enqueueSnackbar } from 'notistack';

import { PROMOTIONAL_EMAIL_ENDPOINT } from '../../utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function PromotionalCommunticationView() {
  const settings = useSettingsContext();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleChangeMessage = (value) => {
    setMessage(value)
  }

  const handleChangeSubject = (e) => {
    setSubject(e.target.value)
  }

  const handleSend = async () => {
    try {
    
      const mappedData = {
        subject: subject,
        body: message,
      };

      const apiUrl = PROMOTIONAL_EMAIL_ENDPOINT;
      const fetchMethod = "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, mappedData);

      if (response.ok) {
        enqueueSnackbar('Email Sent Successfully!');
        setSubject('');
        setMessage('');
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
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Promotional Communtication </Typography>

      <Box
        sx={{
          mt: 5,
          pt: 2 , 
          width: 1,
          height: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
        }}
      >
        <InputBase
          placeholder="Subject"
          value={subject}
          onChange={handleChangeSubject}
          sx={{
            px: 2,
            height: 48,
            width: 1,
            textAlign: 'left',
            borderBottom: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        />
        
        <Stack spacing={2} flexGrow={1} sx={{ p: 2 }}>
          <Editor
            simple
            id="compose-mail"
            value={message}
            onChange={handleChangeMessage}
            placeholder="Type a message"
            sx={{
              textTransform: 'initial',
              '& .ql-editor': {},
              ...({
                height: 1,
                '& .quill': {
                  height: 1,
                },
                '& .ql-editor': {
                  maxHeight: 'unset',
                },
              }),
            }}
          />

          <Stack direction="row" alignItems="center">

            <Button
              onClick={handleSend}
              variant="contained"
              color="primary"
              endIcon={<Iconify icon="iconamoon:send-fill" />}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}

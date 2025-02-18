import React, { useState } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, IconButton, Grid } from '@mui/material';
import { Edit, Add, Delete } from '@mui/icons-material';
import { DealFormData } from '../../../types/DealFormData';

interface BackgroundProps {
  data: DealFormData['background'];
}

const Background: React.FC<BackgroundProps> = ({ data }) => {
  const [tableData, setTableData] = useState(data.syndicate.map((item) => ({ syndicateName: item, editable: false })));
  const [cards, setCards] = useState([1]); // Track multiple cards

  const handleEdit = (index: number) => {
    const updatedData = [...tableData];
    updatedData[index].editable = true;
    setTableData(updatedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedData = [...tableData];
    updatedData[index].syndicateName = e.target.value;
    setTableData(updatedData);
  };

  const handleSave = (index: number) => {
    const updatedData = [...tableData];
    updatedData[index].editable = false;
    setTableData(updatedData);
  };

  const handleAddCard = () => {
    setCards([...cards, cards.length + 1]); // Duplicate the card
  };

  const handleDeleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index)); // Delete a card by its index
  };

  return (
    <div>
      {/* Add Card Button */}
      <IconButton onClick={handleAddCard} color="primary" aria-label="add card" style={{ position: 'fixed', top: '20px', right: '20px' }}>
        <Add />
      </IconButton>

      {/* Render All Cards */}
      {cards.map((_, cardIndex) => (
        <Card key={cardIndex} style={{ marginBottom: '20px' }}>
          <CardContent>
            <Grid container justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Background Information</Typography>

              {/* Edit and Delete Buttons */}
              <div>
                <IconButton onClick={() => handleEdit(cardIndex)} color="primary" aria-label="edit">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteCard(cardIndex)} color="secondary" aria-label="delete">
                  <Delete />
                </IconButton>
              </div>
            </Grid>

            {/* Table for Syndicate data */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Syndicate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {row.editable ? (
                          <TextField
                            value={row.syndicateName}
                            // onChange={(e) => handleChange(e, index)}
                            fullWidth
                          />
                        ) : (
                          row.syndicateName
                        )}
                      </TableCell>
                      <TableCell>
                        {row.editable ? (
                          <Button onClick={() => handleSave(index)} variant="contained" color="primary">
                            Save
                          </Button>
                        ) : (
                          <Button onClick={() => handleEdit(index)} variant="outlined">
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Background;

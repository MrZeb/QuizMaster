import { Card } from '@mui/material';
import React from 'react';

type PlayerProps = {
  name: string
}

 export const PlayerCard = ({ name }: PlayerProps) =>
 <Card>
    <h2>{ name }</h2>
  </Card>
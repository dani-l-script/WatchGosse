const parseCandleStickData = (data) => {
  try {
    /*The xy format accepts  x: date, y: O,H,L,C */
    return data.map( chart => {
        if(chart.open) {
            const {open, high, low, close} = chart
                return {
                  x: new Date(),
                  y: [open, high, low, close]
                };    
        }

    })

  } catch (error) {
    console.log(error);
  }
};

export default parseCandleStickData;
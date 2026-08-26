
import { useState } from 'react';
import { ESewaNepaliDatepicker, ESewaProvider } from 'esewa-ui-library';
import AppBar from './components/AppBar';
import 'esewa-ui-library/dist/index.css';

function App() {

  const [date, setDate] = useState<string>('')


  const handleDateChange = (newDate: string) => {
    setDate(newDate)
  }

  return (
    <ESewaProvider>
      <div>

        <section>

          <h1 className='text-center'>Esewa Components</h1>

          <div>
            <ESewaProvider>
              <ESewaNepaliDatepicker
                label="Select Nepali Date"
                value={date}
                onChange={handleDateChange}
                calenderLocale="ne"  // You can use 'en' for English or 'ne' for Nepali locale
              />
            </ESewaProvider>
          </div>

          <AppBar />

        </section>
      </div>
    </ESewaProvider>
  )
}

export default App

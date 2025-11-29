# Irrigation Area Calculator

This is a web application that helps users calculate their irrigatable area based on their water supply and other parameters. The calculator takes into account:

- Minimum System Capacity (Supply)
- Water Needs
- Operation Hours Per Day
- System Efficiency

## Features

- Real-time calculations
- Multiple unit conversions
- Responsive design
- User-friendly interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

To create a production build:

```bash
npm run build
```

## Usage

1. Enter your Minimum System Capacity (Supply) and select the appropriate unit (GPM or LPS)
2. Enter your Water Needs and select the unit (inches/day or mm/day)
3. Enter the Operation Hours Per Day and select the time unit
4. Enter the System Efficiency as a percentage
5. Select your preferred area unit for the result
6. The calculated irrigatable area will be displayed automatically

## Formula

The calculator uses the following formula to determine the irrigatable area:

```
Area = (System Capacity × Operation Hours × System Efficiency) / (Water Needs × 0.623)
```

Where:
- System Capacity is in GPM (Gallons Per Minute)
- Operation Hours is in hours
- System Efficiency is a decimal (e.g., 0.75 for 75%)
- Water Needs is in inches per day
- 0.623 is a conversion factor 
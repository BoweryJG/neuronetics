import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DepressionDashboard = () => {
  // States in the Southeast
  const southeastStates = ['Georgia', 'Florida', 'Alabama', 'North Carolina', 'South Carolina', 'Tennessee', 'Mississippi'];
  
  // Years for historical and projected data
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];
  
  // Treatment types
  const treatmentTypes = ['Medication Only', 'Therapy Only', 'Medication & Therapy', 'TMS', 'Spravato/Ketamine', 'ECT', 'No Treatment'];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // State for user selections
  const [selectedState, setSelectedState] = useState('Georgia');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [growthRate, setGrowthRate] = useState(5);
  const [tmsAdoption, setTmsAdoption] = useState(15);
  
  // Base data - depression prevalence per 100,000 people
  const baseDepressionData = {
    'Georgia': 7800,
    'Florida': 7600,
    'Alabama': 8200,
    'North Carolina': 7900,
    'South Carolina': 8100,
    'Tennessee': 8400,
    'Mississippi': 8700
  };
  
  // Population data (in millions)
  const populationData = {
    'Georgia': 10.8,
    'Florida': 21.9,
    'Alabama': 5.0,
    'North Carolina': 10.7,
    'South Carolina': 5.2,
    'Tennessee': 7.0,
    'Mississippi': 2.9
  };
  
  // Base treatment distribution (percentage)
  const baseTreatmentDistribution = {
    'Medication Only': 40,
    'Therapy Only': 15,
    'Medication & Therapy': 25,
    'TMS': 2,
    'Spravato/Ketamine': 1,
    'ECT': 0.5,
    'No Treatment': 16.5
  };
  
  // Function to generate state data based on user selections
  const generateStateData = () => {
    return southeastStates.map(state => {
      const baseRate = baseDepressionData[state];
      const population = populationData[state];
      const yearDiff = selectedYear - 2025;
      
      // Calculate adjusted rate with growth factor
      const adjustedRate = baseRate * Math.pow(1 + (growthRate / 100), yearDiff);
      
      // Calculate total depressed population
      const totalDepressed = Math.round((adjustedRate / 100000) * population * 1000000);
      
      // Calculate market value (simplified estimate)
      const avgTreatmentCost = 3500; // average annual cost of depression treatment
      const marketValue = totalDepressed * avgTreatmentCost / 1000000; // in millions
      
      return {
        state,
        prevalenceRate: adjustedRate,
        depressedPopulation: totalDepressed,
        marketValueM: marketValue.toFixed(0),
        population: population.toFixed(1)
      };
    });
  };
  
  // Function to generate treatment distribution data
  const generateTreatmentData = () => {
    // Adjust TMS adoption based on slider
    const adjustedDistribution = {...baseTreatmentDistribution};
    
    // Calculate difference from base TMS adoption
    const tmsDiff = tmsAdoption - baseTreatmentDistribution['TMS'];
    
    // Adjust TMS percentage
    adjustedDistribution['TMS'] = tmsAdoption;
    
    // Adjust other categories proportionally to maintain 100% total
    adjustedDistribution['Medication Only'] = Math.max(30, adjustedDistribution['Medication Only'] - (tmsDiff * 0.5));
    adjustedDistribution['No Treatment'] = Math.max(10, adjustedDistribution['No Treatment'] - (tmsDiff * 0.5));
    
    return Object.keys(adjustedDistribution).map(name => ({
      name,
      value: adjustedDistribution[name]
    }));
  };
  
  // Function to generate historical and projected data
  const generateTrendsData = () => {
    const baseYear = 2025;
    const baseRate = baseDepressionData[selectedState];
    const baseTMS = baseTreatmentDistribution['TMS'];
    
    return years.map(year => {
      const yearDiff = year - baseYear;
      
      // Historical/projected depression rate
      const depRate = baseRate * Math.pow(1 + ((year < 2025 ? 3 : growthRate) / 100), yearDiff);
      
      // Historical/projected TMS adoption
      let tmsPct;
      if (year < 2025) {
        // Historical data - lower adoption in the past
        tmsPct = Math.max(0.5, baseTMS - ((2025 - year) * 0.5));
      } else {
        // Future projection based on slider
        tmsPct = baseTMS + ((year - 2024) * ((tmsAdoption - baseTMS) / 3));
      }
      
      return {
        year,
        depressionRate: depRate.toFixed(0),
        tmsAdoption: tmsPct.toFixed(1),
        marketGrowth: ((depRate / baseRate) * 100).toFixed(1)
      };
    });
  };
  
  // Calculate available patient data for selected state
  const calculatePatientData = () => {
    const population = populationData[selectedState] * 1000000;
    const baseRate = baseDepressionData[selectedState];
    const yearDiff = selectedYear - 2025;
    const adjustedRate = baseRate * Math.pow(1 + (growthRate / 100), yearDiff);
    
    const totalDepressed = Math.round((adjustedRate / 100000) * population);
    const treatedPatients = Math.round(totalDepressed * (1 - (baseTreatmentDistribution['No Treatment'] / 100)));
    const tmsEligible = Math.round(treatedPatients * 0.4); // Assuming 40% of treated patients failed 2+ medications
    const currentTMSPatients = Math.round(totalDepressed * (tmsAdoption / 100));
    const untappedMarket = tmsEligible - currentTMSPatients;
    
    return {
      totalDepressed,
      treatedPatients,
      tmsEligible,
      currentTMSPatients,
      untappedMarket
    };
  };
  
  const stateData = generateStateData();
  const treatmentData = generateTreatmentData();
  const trendsData = generateTrendsData();
  const patientData = calculatePatientData();
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Depression Treatment Market Analysis</h1>
      <p className="text-center mb-6 text-gray-600">Interactive dashboard for Southeastern states</p>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {southeastStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Depression Growth Rate: {growthRate}%
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={growthRate}
            onChange={(e) => setGrowthRate(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TMS Adoption Rate: {tmsAdoption}%
          </label>
          <input
            type="range"
            min="2"
            max="30"
            value={tmsAdoption}
            onChange={(e) => setTmsAdoption(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Depression in {selectedState} ({selectedYear})</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Population</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(populationData[selectedState] * 1000000)}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Prevalence Rate</p>
              <p className="text-xl font-bold text-gray-800">{stateData.find(s => s.state === selectedState).prevalenceRate.toFixed(0)} per 100k</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Depressed Patients</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(patientData.totalDepressed)}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Market Value</p>
              <p className="text-xl font-bold text-gray-800">${stateData.find(s => s.state === selectedState).marketValueM}M</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">TMS Opportunity</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">TMS Eligible Patients</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(patientData.tmsEligible)}</p>
              <p className="text-xs text-gray-500">Patients who failed 2+ medications</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Current TMS Patients</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(patientData.currentTMSPatients)}</p>
              <p className="text-xs text-gray-500">Based on {tmsAdoption}% adoption rate</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-sm text-gray-500">Untapped Market</p>
              <p className="text-xl font-bold text-blue-600">{formatNumber(patientData.untappedMarket)}</p>
              <p className="text-xs text-gray-500">Eligible patients not receiving TMS</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Market Comparison</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stateData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tickFormatter={(value) => `${value}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="marketValueM" name="Market Value ($M)" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Treatment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={treatmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {treatmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Depression Rate by State</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stateData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" tick={{ fontSize: 10 }} interval={0} />
                <YAxis domain={[7000, 9000]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="prevalenceRate" name="Depression Rate per 100k" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Trends */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Historical & Projected Trends for {selectedState}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" domain={[7000, 9000]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 30]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="depressionRate" 
                name="Depression Rate per 100k" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="tmsAdoption" 
                name="TMS Adoption %" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Untapped market visualization */}
      <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Market Opportunity for NeuroStar in {selectedState}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium text-gray-700 mb-2">Current vs. Potential TMS Patients</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Current TMS Patients', value: patientData.currentTMSPatients },
                      { name: 'Untapped Opportunity', value: patientData.untappedMarket }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#00C49F" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium text-gray-700 mb-2">Dr. Bora's Market Potential</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Local Market Area (30-mile radius)</p>
                <p className="text-2xl font-bold text-blue-800">{formatNumber(Math.round(patientData.tmsEligible * 0.15))}</p>
                <p className="text-xs text-gray-500">TMS-eligible patients within your service area</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Potential Annual TMS Patients</p>
                <p className="text-2xl font-bold text-blue-800">{formatNumber(Math.round(patientData.tmsEligible * 0.15 * 0.1))}</p>
                <p className="text-xs text-gray-500">With 10% market share in your service area</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Potential Annual Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${formatNumber(Math.round(patientData.tmsEligible * 0.15 * 0.1 * 12000))}
                </p>
                <p className="text-xs text-gray-500">Average $12,000 per TMS treatment course</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>Note: This interactive model uses estimated depression prevalence data and treatment patterns based on published research. 
        Actual figures may vary. Adjust parameters to explore different scenarios.</p>
      </div>
    </div>
  );
};

export default DepressionDashboard;
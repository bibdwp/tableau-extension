import React, { useEffect, useState } from 'react';
import './App.css';

const { tableau } = window;

const filtersToHide = new Set([
  'Autorefresh',
  'Rozkład czasu widocznosci',
  'Kategoria',
  'Kontent Kategoria',
  'Lazy Loading',
  'Przeglądarka',
  'Strona Amp'
]);


function App() {
  const [areTrue, setAreTrue] = useState({
    'Autorefresh': true,
    'Rozkład czasu widocznosci': true,
    'Kategoria': true,
    'Kontent Kategoria': true,
    'Lazy Loading': true,
    'Przeglądarka': true,
    'Strona Amp': true
  })

  function areAllTrue(vals) {
    return Object.values(vals).every(val => val === true)
  }

  function setHideColumn(val) {
    tableau.extensions.dashboardContent.dashboard.findParameterAsync('isHideColumn').then(param =>
      param.changeValueAsync(val));
  };

  useEffect(() => {
    tableau.extensions.initializeAsync();

    tableau.extensions.initializeAsync().then(() => {
      tableau.extensions.dashboardContent.dashboard.worksheets.map(worksheet =>
        worksheet.addEventListener(tableau.TableauEventType.FilterChanged, onFilterChange));
    });
  }, []);

  async function updateParameter(param_name, value) {
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((parameters) => {
      parameters.forEach((param) => {
        if (param.name === param_name) {
          param.changeValueAsync(value);
        };
      });
    });
  };

  async function getValsForAPI() {
    tableau.extensions.dashboardContent.dashboard.worksheets.map(worksheet =>
      worksheet.getFiltersAsync().then(function (filters) {

        filters.forEach((filter) => {
          // /\s+/g - remove whitespace
          if (filter.worksheetName === 'API') {
            let filterName = 'ep' + filter.fieldName.replace(/\s+/g, '_').trim();
            let filterVals;

            // /,\s*$/ - remove trailing comma
            if (filter._filterType === 'categorical') {
              if (!filter.isAllSelected) {
                filterVals = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '');
              } else {
                filterVals = 'All';
              };
            } else if (filter._filterType === 'range') {
              filterVals = '{"date_start":"' + filter.minValue.formattedValue + '",' + '"date_end":"' + filter.maxValue.formattedValue + '"}';
            }

            filterVals = filterVals.replace(/,\s*$/, '').trim();

            updateParameter(filterName, filterVals);

            console.log([filterName, filterVals]);
          };

          if (filter.worksheetName === 'API2') {
            // /\s+/g - remove whitespace
            let filterName = 'ep2' + filter.fieldName.replace(/\s+/g, '_').trim();
            let filterVals;

            if (filter._filterType === 'categorical') {
              if (!filter.isAllSelected) {
                filterVals = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '');
              } else {
                filterVals = 'All';
              };
            } else if (filter._filterType === 'range') {
              filterVals = '{"date_start":"' + filter.minValue.formattedValue + '",' + '"date_end":"' + filter.maxValue.formattedValue + '"}';
            }

            // /,\s*$/ - remove trailing comma
            filterVals = filterVals.replace(/,\s*$/, '').trim();

            updateParameter(filterName, filterVals);

            console.log([filterName, filterVals]);
          };
        });
      }));

    setHideColumn(false)
    
  };

  function onFilterChange(filterChangeEvent) {
    filterChangeEvent.getFilterAsync().then((filter) => {
      if (filter.fieldName === 'Abtest') {
        let paramVal = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '').replace(/,\s*$/, '');
        paramVal = paramVal.substring(paramVal.lastIndexOf('|') + 1).trim();
        updateParameter('ep_wybrana_wer_bazowa', paramVal);
      }

      if ((filter.worksheetName === "VIMP" || filter.worksheetName === "Adplacement") && filtersToHide.has(filter.fieldName)) {

        areTrue[filter.fieldName] = filter.isAllSelected;
        setAreTrue(areTrue);
        setHideColumn(!areAllTrue(areTrue));
      };

    });
  };

  return (
    <div>
      <button className='button' onClick={getValsForAPI}>GO</button>
    </div>
  );

}

export default App;
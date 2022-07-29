import React, { useEffect } from 'react';
import './App.css';

const { tableau } = window;


function App() {
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
  };

  function onFilterChange(filterChangeEvent) {
    filterChangeEvent.getFilterAsync().then((filter) => {
      if (filter.fieldName === 'Abtest') {
        let paramVal = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '').replace(/,\s*$/, '');
        paramVal = paramVal.substring(paramVal.lastIndexOf('|') + 1).trim();
        updateParameter('ep_wybrana_wer_bazowa', paramVal);
      }

    });
  };

  return (
    <div>
      <button className='button' onClick={getValsForAPI}>GO</button>
    </div>
  );

}

export default App;
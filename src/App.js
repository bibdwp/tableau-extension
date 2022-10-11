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
  });

  const [disabled, setDisabled] = useState(false);

  function handleDisabled(val) {
    setDisabled(val);
  }
  
  function areAllTrue(vals) {
    return Object.values(vals).every(val => val === true)
  }

  function setHideColumn(val) {
    tableau.extensions.dashboardContent.dashboard.findParameterAsync('isHideColumn').then(param =>
      param.changeValueAsync(val));
  };

  useEffect(() => {
    tableau.extensions.initializeAsync().then(() => {
      tableau.extensions.dashboardContent.dashboard.worksheets.map(worksheet =>
        worksheet.addEventListener(tableau.TableauEventType.FilterChanged, onFilterChange));
    });
  }, []);

  function updateParameter(param_name, value) {
    tableau.extensions.dashboardContent.dashboard.findParameterAsync(param_name).then(param =>
      param.changeValueAsync(value));
  };

  async function handleSite(filter) {
    const val = await filter.getDomainAsync();
    let result;

    try {
      result = (val.values.length === 1) ? val._values[0]._nativeValue : "All";
    } catch (e) {
      result = "All";
      console.log(e);
    }

    return result;

  };

  function getValsForAPI() {
    tableau.extensions.dashboardContent.dashboard.worksheets.map(worksheet =>
      worksheet.getFiltersAsync().then(function (filters) {

        filters.forEach(async function (filter) {
          if (filter.worksheetName === 'API') {
            // /\s+/g - remove whitespace
            let filterName = 'ep' + filter.fieldName.replace(/\s+/g, '_').trim();
            let filterVals;

            if (filter.filterType === 'categorical') {
              if (filter.isAllSelected && filter.fieldName === 'Serwis') {
                filterVals = await handleSite(filter);
              } else if (!filter.isAllSelected) {
                filterVals = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '');
              } else {
                filterVals = 'All';
              };
            } else if (filter._filterType === 'range') {
              filterVals = '{"date_start":"' + filter.minValue.formattedValue + '",' + '"date_end":"' + filter.maxValue.formattedValue + '"}';
            } else {
              filterVals = ' '
            }

            // /,\s*$/ - remove trailing comma
            filterVals = filterVals.replace(/,\s*$/, '').trim();

            updateParameter(filterName, filterVals);

            console.log([filterName, filterVals]);

          } else if (filter.worksheetName === 'API2') {
            // /\s+/g - remove whitespace
            let filterName = 'ep2' + filter.fieldName.replace(/\s+/g, '_').trim();
            let filterVals;

            if (filter._filterType === 'categorical') {
              if (filter.isAllSelected && filter.fieldName === 'Serwis') {
                filterVals = await handleSite(filter);
              } else if (!filter.isAllSelected) {
                filterVals = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '');
              } else {
                filterVals = 'All';
              };
            } else if (filter._filterType === 'range') {
              filterVals = '{"date_start":"' + filter.minValue.formattedValue + '",' + '"date_end":"' + filter.maxValue.formattedValue + '"}';
            } else {
              filterVals = ' '
            }

            // /,\s*$/ - remove trailing comma
            filterVals = filterVals.replace(/,\s*$/, '').trim();

            updateParameter(filterName, filterVals);

            console.log([filterName, filterVals]);
          } else if (filter.worksheetName === 'API3') {
            // /\s+/g - remove whitespace
            let filterName = 'ep3' + filter.fieldName.replace(/\s+/g, '_').trim();
            let filterVals;

            if (filter._filterType === 'categorical') {
              if (filter.isAllSelected && filter.fieldName === 'Serwis') {
                filterVals = await handleSite(filter);
              } else if (!filter.isAllSelected) {
                filterVals = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '');
              } else {
                filterVals = 'All';
              };
            } else if (filter._filterType === 'range') {
              // eslint-disable-next-line
              filterVals = '{"date_start":"' + filter.minValue.formattedValue + '",' + '"date_end":"' + filter.maxValue.formattedValue + '"}';
            } else {
              filterVals = ' '
            }

            // /,\s*$/ - remove trailing comma
            filterVals = filterVals.replace(/,\s*$/, '').trim();

            updateParameter(filterName, filterVals);

            console.log([filterName, filterVals]);
          };

        });
      }));

    setHideColumn(false);

  };

  function onFilterChange(filterChangeEvent) {
    filterChangeEvent.getFilterAsync().then((filter) => {

      if (filter.worksheetName === 'extension_wersja_bazowa4' && (filter.fieldName === 'Abtest Wersja' || filter.fieldName === 'Wersja')) {
        let val = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue, '');
        updateParameter('wersja_baz_4_zakladka', val);
      } else if (filter.worksheetName === 'extension_wersja_bazowa3' && (filter.fieldName === 'Abtest Wersja' || filter.fieldName === 'Wersja')) {
        let val = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue, '');
        updateParameter('wersja_baz_3_zakladka', val);
      } else if (filter.fieldName === 'Abtest Id') {
        updateParameter('ep_wybrana_wer_bazowa', ' ');
        handleDisabled(true);
      } else if (filter.fieldName === 'Abtest') {
        let paramVal = filter.appliedValues.reduce((acc, val) => acc + val._formattedValue + ',', '').replace(/,\s*$/, '');
        paramVal = paramVal.substring(paramVal.lastIndexOf('|') + 1).trim();
        updateParameter('ep_wybrana_wer_bazowa', paramVal);
        handleDisabled(false);
      } else if ((filter.worksheetName === "VIMP" || filter.worksheetName === "Adplacement" || filter.worksheetName === "Slot") && filtersToHide.has(filter.fieldName)) {
        areTrue[filter.fieldName] = filter.isAllSelected;
        setAreTrue(areTrue);
        setHideColumn(!areAllTrue(areTrue));
      };

    });
  };

  return (
    <div title={disabled === true ? 'Wybierz wersję referencyjną aby aktywować przycisk "Wylicz istotność".' : ''}>
      <button disabled={disabled} className='button' onClick={getValsForAPI}>Wylicz istotność</button>
    </div>
  );

}

export default App;
let filteredDataSetTSP = null;
let dataSetTSP = "";  // Dataset for TSP search
let dataSetOrgTSP = dataSetTSP;  // Original dataset for TSP

const displayItemsTSP = (dataResSet) => {
    let html = '';
    if (dataResSet.length === 0) {
        html += `<tr><td colspan="5"><span style="color:red;">No records found!</span></td></tr>`;
    } else {
        dataResSet.forEach((element, index) => {
            html += `<tr>
                        <td>${index + 1}</td>
                        <td>
                            ID: ${element.id}<br>
                            Name: ${element.name}<br>
                            Website: ${element.website}
                        </td>
                        <td>${element.role}</td>
                        <td>${element.domains_tested}</td>
                        <td>${element.np_client}</td>
                    </tr>`;
        });
    }

    let table = `<table class="table tsp-res-table">
                    <thead>
                        <tr>
                            <td>#</td>
                            <td>Organization Details</td>
                            <td>Roles</td>
                            <td>Domains tested on Pramaan</td>
                            <td>NP Clients</td>
                        </tr>
                    </thead>
                    <tbody>${html}</tbody>
                </table>`;

    document.querySelector('#tsp-res-div').innerHTML = table;
}

function loadTSPData() {
    fetch('json/pramaan_tsp.json')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => a.name.localeCompare(b.name));
            dataSetOrgTSP = data;
            displayItemsTSP(dataSetOrgTSP);
        });
}

// Search functionality for TSP section
const processSearchTSP = () => {
    let dataSet = dataSetOrgTSP;  // Original TSP dataset

    const searchCriteria = {
        organization: txtSearch2.value.trim().toLowerCase() ? [txtSearch2.value.trim().toLowerCase()] : [],
        role: txtSearch3.value.trim().toLowerCase() ? [txtSearch3.value.trim().toLowerCase()] : [],
        domain: txtSearch.value.trim().toLowerCase() ? [txtSearch.value.trim().toLowerCase()] : []
    };

    if (searchCriteria.organization.length || searchCriteria.role.length || searchCriteria.domain.length) {
        dataSet = filterConditionsTSP(dataSet, searchCriteria);
    }

    displayItemsTSP(dataSet);  // Display the filtered TSP results
}

const filterConditionsTSP = (dataset, searchCriteria) => {
    return dataset.filter(d => {
        const matchesOrg = searchCriteria.organization.length > 0 
            ? searchCriteria.organization.some(term => 
                (d.id?.toLowerCase() || '').includes(term) || 
                (d.name?.toLowerCase() || '').includes(term) || 
                (d.website?.toLowerCase() || '').includes(term)
            ) 
            : true;

        const matchesRole = searchCriteria.role.length > 0 
            ? searchCriteria.role.some(term => (d.role?.toLowerCase() || '').includes(term)) 
            : true;

        const matchesDomain = searchCriteria.domain.length > 0 
            ? searchCriteria.domain.some(term => (d.domains_tested?.toLowerCase() || '').includes(term)) 
            : true;

        return matchesOrg && matchesRole && matchesDomain;
    });
}

// Input field selectors for TSP search
var txtSearch = document.getElementById('domain');
var txtSearch2 = document.getElementById('organisation-details');
var txtSearch3 = document.getElementById('role');

// Handle Enter key press for TSP section
[txtSearch, txtSearch2, txtSearch3].forEach(input => {
    if (input) input.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) {
            processSearchTSP();
        }
    });
});

loadTSPData();  // Load TSP data on page load


function Clearbtn(){
    txtSearch.value = ""
    txtSearch2.value = ""
    txtSearch3.value = ""
    loadTSPData();
}

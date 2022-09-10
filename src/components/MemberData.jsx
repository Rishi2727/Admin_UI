import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {Modal, Button} from "react-bootstrap"

import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";


function MemberData() {
  const endpoint =
    "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"; // API endpints
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [filteredMember, setfilteredMember] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editId, setEditShow] = useState(false);
  const [editData, setEditData] = useState('');

  const handleClose = () => setEditShow(false);
  const handleShow = (id) => {
    setEditShow(Number(id));
    let d = members.filter(member => {return (Number(member["id"]) === Number(id));});
    d = (d.length) ? d[0] : {"name":"","email":"","role":"member"};
    setEditData(d);
  }

  const setEditForm = (e) => {
    let d = editData;
    d[e.target.name] = e.target.value;
    setEditData(d);
  }

  const handleChange = () => {
    const afterEdit = members.map(member => {
      if (member["id"] == editId) {
        member["name"] = editData.name;
        member["email"] = editData.email;
        member["role"] = editData.role;
      }
      return member;
    });
    console.log(editId);
    setMembers(afterEdit);
    handleClose();
  }

 

  const deleteme = id => {
    var ids = []
    if(id!==-1){
      ids = [id];
    }
    else{
      for (const [key,value] of Object.entries(selectedRows.selectedRows)) {
          ids.push(value['id'])
      }
    }
    const afterDelete = members.filter(member => {
      return (
        !(ids.includes(member["id"]))
      );
    });
    console.log(afterDelete)
    setMembers(afterDelete);
  };

  const getNumberOfPages = (rowCount, rowsPerPage) => {
    return Math.ceil(rowCount / rowsPerPage);
  };

  const toPages = pages => {
    const results = [];

    for (let i = 1; i < pages; i++) {
      results.push(i);
    }

    return results;
  };




  // RDT exposes the following internal pagination properties
  const BootyPagination = ({
    rowsPerPage,
    rowCount,
    onChangePage,
    onChangeRowsPerPage, // available but not used here
    currentPage,
  }) => {
    const handleBackButtonClick = () => {
      onChangePage(currentPage - 1);
    };
    const handlefirstButtonClick = () => {
      onChangePage(1);
    };

    const handleNextButtonClick = () => {
      onChangePage(currentPage + 1);
    };

    const handlePageNumber = e => {
      onChangePage(Number(e.target.value));
    };
    const handleLastButtonClick = e => {
      onChangePage(getNumberOfPages(rowCount, rowsPerPage) - 1);
    };

    const pages = getNumberOfPages(rowCount, rowsPerPage);
    const pageItems = toPages(pages);
    const nextDisabled = currentPage === pageItems.length;
    const previosDisabled = currentPage === 1;

    return (
      <nav>
        <ul className="pagination">
          <li className="page-item">
            <button
              className="page-link"
              onClick={handlefirstButtonClick}
              aria-label="First Page"
            >
              &#60;&#60;
            </button>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={handleBackButtonClick}
              disabled={previosDisabled}
              aria-disabled={previosDisabled}
              aria-label="previous page"
            >
              &#60;
            </button>
          </li>
          {pageItems.map(page => {
            const className =
              page === currentPage ? "page-item active" : "page-item";

            return (
              <li key={page} className={className}>
                <button
                  className="page-link"
                  onClick={handlePageNumber}
                  value={page}
                >
                  {page}
                </button>
              </li>
            );
          })}
          <li className="page-item">
            <button
              className="page-link"
              onClick={handleNextButtonClick}
              disabled={nextDisabled}
              aria-disabled={nextDisabled}
              aria-label="next page"
            >
              &#62;
            </button>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={handleLastButtonClick}
              disabled={nextDisabled}
              aria-disabled={nextDisabled}
              aria-label="Last page"
            >
              &#62;&#62;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const BootyCheckbox = React.forwardRef(({ onClick, ...rest }, ref) => (
    <div className="form-check">
      <input
        htmlFor="booty-check"
        type="checkbox"
        className="form-check-input"
        ref={ref}
        onClick={onClick}
        {...rest}
      />
      <label className="form-check-label" id="booty-check" />
    </div>
  ));

  const getMembers = async () => {
    try {
      // Data fetch from the endpoints
      const response = await axios.get(endpoint);
      setMembers(response.data);
      setfilteredMember(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "Role",
      selector: row => row.role,
      sortable: true,
    },
    {
      name: "Action",
      selector: row => (
        <a href="#">
          <i
            className="fa fa-pencil-square-o fa-2x fa-pull-left" 
            style={{ color: "black" }}
            aria-hidden="true"
            onClick={() => handleShow(row.id)}
          ></i>
          <i
            className="fa fa-trash-o fa-2x fa-pull-left"
            style={{ color: "red" }}
            aria-hidden="true"
            onClick={() => deleteme(row.id)}
          ></i>
        </a>
      ),
    },
  ];

  useEffect(() => {
    getMembers();
  }, []);

  useEffect(() => {
    const results = members.filter(member => {
      return (
        member["name"].toLowerCase().match(search.toLowerCase()) ||
        member["email"].toLowerCase().match(search.toLowerCase()) ||
        member["role"].toLowerCase().match(search.toLowerCase())
      );
    });

    setfilteredMember(results);
  }, [search,members,editData]);

  return (
    <>
    <DataTable
      columns={columns}
      data={filteredMember}
      defaultSortFieldID={1}
      pagination
      selectableRowsHighlight
      selectableRows
      paginationComponent={BootyPagination}
      fixedHeader
      fixedHeaderScrollHeight="400px"
      selectableRowsComponent={BootyCheckbox}
      highlightOnHover
      onSelectedRowsChange={setSelectedRows}
      actions={
        <button className="btn btn-danger" onClick={() => deleteme(-1)}>
          Selected Delete
        </button>
      }
      subHeader
      subHeaderComponent={
        <input
          type="text"
          placeholder="Search here"
          className="form-control"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      }
    />
    <Modal show={editId} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member Data</Modal.Title>
        </Modal.Header>
  
        <Modal.Body>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Email</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" onChange={setEditForm} name="email" defaultValue={editData.email} />  
              </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Name</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" onChange={setEditForm} name="name" defaultValue ={editData.name} />  
              </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Role</label>
              <div className="col-sm-10">
                <select className="form-control" onChange={setEditForm} name="role" defaultValue={editData.role}>
                    <option value="admin">ADMIN</option>
                    <option value="member">MEMBER</option>
                </select>
              </div>
          </div>
        </Modal.Body>
  
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleChange}>Save changes</Button>
        </Modal.Footer>
      </Modal>
        
    </>
  );
}
export default MemberData;

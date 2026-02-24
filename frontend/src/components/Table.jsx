import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, EllipsisVertical } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";
import TableActionMenu from "./TableAction";
import SkeletionTable from "./skeletons/TableLoading";
import { empty } from "../assets";

const Table = ({
  columns,
  data,
  title,
  tabs,
  actions,
  isSeeAll,
  viewHref,
  seeAllHref,
  loading,
  isFilters,
  forCheck,
  hideActions,
  getList,
  pagination,
  showViewBtn,
  handleShowViewBtn,
  setSelectedRow,
  showDropUsers,
  dropUsers,
  emptyText,
  setPagination,
  viewText,
  viewBtnDisabled,
  isSearch,
  hideSearch,
}) => {
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(tabs ? tabs[0] : "");
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const {
    page = 1,
    perPage = 10,
    totalPages = 1,
    total = 0,
  } = pagination || {};
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const handleSort = (column) => {
    setSortConfig((prev) => {
      if (prev.key !== column) {
        return { key: column, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key: column, direction: "desc" };
      }

      if (prev.direction === "desc") {
        return { key: null, direction: null };
      }

      return { key: column, direction: "asc" };
    });
  };

  const handleOpen = (id) => {
    setId(id);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [id, setId] = useState();

  const filteredData = useMemo(() => {
    let baseData = data;
    if (!filterText) return data;

    return baseData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(filterText.toLowerCase()),
      ),
    );
  }, [data, filterText, selectedTab]);

  const parseCurrency = (value) => {
    if (typeof value !== "string") return value;

    // Remove currency symbol, commas, spaces
    const cleaned = value.replace(/[₦,\s]/g, "");

    const number = parseFloat(cleaned);

    return isNaN(number) ? value : number;
  };

  const parseDateString = (value) => {
    if (typeof value !== "string") return null;

    // Example: "7th December, 2025"
    const match = value.match(
      /^(\d{1,2})(st|nd|rd|th)?\s+([A-Za-z]+),\s*(\d{4})$/,
    );

    if (!match) return null;

    const day = Number(match[1]);
    const monthName = match[3];
    const year = Number(match[4]);

    const months = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    const monthIndex = months[monthName.toLowerCase()];
    if (monthIndex === undefined) return null;

    return new Date(year, monthIndex, day).getTime();
  };

  const normalizeValue = (value) => {
    if (value == null) return value;

    // Try currency
    const currency = parseCurrency(value);
    if (currency !== null) return currency;

    // Try date
    const date = parseDateString(value);
    if (date !== null) return date;

    // Try number
    if (typeof value === "number") return value;

    // Fallback to string
    return String(value).toLowerCase();
  };

  const currentData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = normalizeValue(a[sortConfig.key]);
      const bVal = normalizeValue(b[sortConfig.key]);

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const generatePageNumbers = () => {
    const totalPages = pagination?.totalPages || 1;
    const currentPage = pagination?.page || 1;
    const delta = 2;

    const pages = [];
    pages.push(1);

    if (currentPage > delta + 2) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - (delta + 1)) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const isAllChecked =
    currentData?.length > 0 &&
    currentData?.every((row) => selectedRows.includes(row.id));
  const toggleSelectAll = () => {
    if (isAllChecked) {
      setSelectedRows((prev) =>
        prev.filter((id) => !currentData?.some((row) => row.id === id)),
      );
    } else {
      setSelectedRows((prev) => [
        ...prev,
        ...currentData
          .filter((row) => !prev.includes(row.id))
          .map((row) => row.id),
      ]);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="bg-white border p-6 border-[#E9EAEA] rounded-2xl shadow-sm"
      >
        <SkeletionTable count={3} />
      </motion.div>
    );
  }

  const renderStatus = (status) => {
    const styles = {
      unpaid: "text-[#f0de3d] border border-[#faf4c3] bg-[#fefcec]",
      pending: "text-[#f0de3d] border border-[#faf4c3] bg-[#fefcec]",
      "partially compliant":
        "text-[#f0de3d] border border-[#faf4c3] bg-[#fefcec]",
      paid: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      active: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      approved: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      confirmed: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      Confirmed: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      compliant: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      overdue: "text-red-600 border border-red-300 bg-red-50",
      rejected: "text-red-600 border border-red-300 bg-red-50",
      Revenue: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      in: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      Expenditure: "text-red-600 border border-red-300 bg-red-50",
      out: "text-red-600 border border-red-300 bg-red-50",

      suspended: "text-red-600 border border-red-300 bg-red-50",
      "non compliant": "text-red-600 border border-red-300 bg-red-50",
    };
    const key = status?.toLowerCase();
    return (
      <p
        className={`${styles[key]} whitespace-nowrap rounded-full px-2 inline-block`}
      >
        {status}
      </p>
    );
  };

  const renderOther = (other) => {
    const styles = {
      "Not linked": "text-[#f0de3d] border border-[#faf4c3] bg-[#fefcec]",
      Linked: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      revenue: "text-[#009499] border border-[#B0DEDF] bg-[#E6F4F5]",
      expenditure: "text-red-600 border border-red-300 bg-red-50",
    };
    const key = other?.toLowerCase();
    return (
      <p
        className={`${styles[key]} whitespace-nowrap rounded-full px-2 inline-block`}
      >
        {other}
      </p>
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    if (newPage >= 1 && newPage <= totalPages) {
      if (getList) {
        getList(newPage);
      } else {
        setCurrentPage(newPage);
        setPagination({ ...pagination, page: newPage });
      }
    }
  };

  return (
    <div className="bg-white border border-[#E9EAEA] rounded-2xl shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="flex justify-between mb-7hg border-b p-6"
      >
        {tabs ? (
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setCurrentPage(1);
                }}
                className={`border-b-2 font-bold ${
                  tab === selectedTab
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-500"
                } pb-1`}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="text-xl font-semibold">{title}</h2>
        )}
        {hideSearch ? null : (
          <div className="flex items-center gap-5">
            {/* {isFilters && <Filter />} */}{" "}
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1); // reset pagination when searching
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isSeeAll && (
              <Button variant="outline" className="  " href={seeAllHref}>
                See all
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="px-6 pb-6"
      >
        {" "}
        {currentData?.length === 0 ? (
          <div className="h-[400px] w-full flex-col flex items-center justify-center ">
            <img src={empty} alt="" />
            <h3 className="text-2xl mb-1 font-bold">No Record yet</h3>
            <p className="text-sec-300">{emptyText}</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                {/* {forCheck && (
                  <th className='px-3 py-3 border-b'>
                    <Checkbox value={isAllChecked} onChange={toggleSelectAll} />
                  </th>
                )} */}
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    // className="px-3 py-5 border-b text-primary-500 text-[16px] font-semibold cursor-pointer select-none"
                    className={`px-3 py-5 border-b text-[16px] font-semibold cursor-pointer select-none
  ${sortConfig.key === col ? "text-primary-600" : "text-primary-500"}
`}
                  >
                    {sortConfig.key === col && ""}
                    {col}
                  </th>
                ))}
                {/* {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-5 border-b text-primary-500 text-[16px] font-semibold"
                  >
                    {col}
                  </th>
                ))} */}
                {hideActions ? null : (
                  <>
                    {/* {actions.length != 0 && ( */}
                    <th className="px-3 py-2 border-b"></th>
                    {/* )} */}
                  </>
                )}
                {showViewBtn ? (
                  <th className="px-3 py-2 border-b text-gray-500 text-[16px] font-semibold">
                    Action
                  </th>
                ) : null}
                {showDropUsers ? (
                  <th className="px-3 py-2 border-b text-gray-500 text-[16px] font-semibold">
                    Action
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              <>
                {" "}
                {currentData?.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {/* {forCheck && (
                      <td className='px-3 py-6'>
                        <Checkbox
                          value={selectedRows.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                        />
                      </td>
                    )}{' '} */}
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-7 text-gray-500">
                        {/* {row[col]} */}
                        {col?.toLowerCase() === "status" ? (
                          renderStatus(row[col])
                        ) : col?.toLowerCase() === "catholicpay" ? (
                          renderOther(row[col])
                        ) : col?.toLowerCase() === "category" ? (
                          renderOther(row[col])
                        ) : col?.toLowerCase() === "total" ? (
                          <b>{row[col]}</b>
                        ) : col?.toLowerCase() === "field" ? (
                          <b>{row[col]}</b>
                        ) : (
                          row[col]
                        )}
                      </td>
                    ))}
                    {hideActions ? null : (
                      <>
                        {/* {actions.length != 0 && ( */}
                        <td className="px-3 py-2">
                          <TableActionMenu
                            options={[
                              {
                                label: "View",
                                href: `${viewHref}/${row.id}`,
                              },
                              {
                                label: "Edit",
                                href: `/dashboard/personnel/update/${row.id}`,
                              },
                              // {
                              //   label: 'Delete',
                              //   onClick: () => handleOpen(row?.id),
                              // },
                            ]}
                          />
                        </td>
                        {/* )} */}
                      </>
                    )}
                    {showViewBtn ? (
                      <td className="px-3 py-2">
                        <Button
                          disabled={
                            typeof viewBtnDisabled === "function"
                              ? viewBtnDisabled(row)
                              : viewBtnDisabled
                          }
                          onClick={() => {
                            // setSelectedRow(row);
                            handleShowViewBtn(row);
                          }}
                          className={``}
                        >
                          {typeof viewText === "function"
                            ? viewText(row)
                            : viewText}
                        </Button>
                      </td>
                    ) : null}
                    {showDropUsers ? (
                      <td
                        className="px-3 py-2"
                        onClick={() => {
                          setSelectedRow(row);
                        }}
                      >
                        {" "}
                        {typeof dropUsers === "function"
                          ? dropUsers(row)
                          : dropUsers}
                        {/* {dropUsers} */}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </>
            </tbody>
          </table>
        )}
        {/* <DeletePersonnel
          open={open}
          id={id}
          getList={getList}
          handleClose={handleClose}
        /> */}
        {pagination && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1}-
              {Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border rounded-lg text-gray-600 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                disabled={page === "..."}
                onClick={() => handlePageChange(p)}
                className={`p-2 px-4 font-semibold rounded-lg ${
                  p === page
                    ? "bg-primary-100 text-primary-500"
                    : "border text-gray-600"
                }`}
              >
                {p}
              </button>
            ))} */}

              {generatePageNumbers(pagination).map((page, pageIdx) => (
                <div key={pageIdx}>
                  {page === "..." ? (
                    <span
                      key={`ellipsis-${pageIdx}`}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      className={`p-2 px-4  font-semibold rounded-lg  ${
                        pagination?.page === page
                          ? "bg-primary-100 text-primary-500"
                          : "border text-gray-600"
                      }    `}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 border rounded-lg text-gray-600 disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Table;

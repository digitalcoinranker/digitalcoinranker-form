import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getAllCountries } from "react-country-list";
import {
  Container,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

function useQuery() {
  return new URLSearchParams(window.location.search);
}

const validationSchema = Yup.object({
  client_fullName: Yup.string().required("Full Name is required"),
  client_email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  client_phoneNum: Yup.string()
    .matches(/^\+?\d+$/, "Invalid phone number format")
    .required("Phone Number is required"),
  client_billAddress1: Yup.string().required("Billing Address 1 is required"),
  client_billCity: Yup.string().required("Billing City is required"),
  client_billZipcode: Yup.string().required("Billing Zipcode is required"),
  client_billCountry: Yup.string().required("Billing Country is required"),
  cryptocurrency: Yup.string().required("Cryptocurrency is required"),
  currency: Yup.string().required("Currency is required"),
  fiat_amount: Yup.string()
    .test(
      "min",
      "Minimum fiat amount allowed is 50 EUR",
      (value) => parseFloat(value) >= 50
    )
    .test(
      "max",
      "Maximum fiat amount allowed is 700 EUR",
      (value) => parseFloat(value) <= 700
    )
    .required("Crypto amount is required"),
    crypto_wallet: Yup.string().required("Crypto wallet is required"),
});

const fiatList = [{ id: 4, name: "EUR" }];
const coinsList = [{ id: 0, name: "BTC" }];

const FormComponent = () => {
  const query = useQuery();
  const [countryList, setCountryList] = useState([]);
  const [rates, setRates] = useState([]);
  const [calculatedValues, setCalculatedValues] = useState({
    fiatAmountInUSD: 0,
    cryptoAmountInUSD: 0,
  });
  const [availableCryptos, setAvailableCryptos] = useState(coinsList);

  useEffect(() => {
    setCountryList(getAllCountries());
    fetch("https://api.coincap.io/v2/rates")
      .then((response) => response.json())
      .then((data) => setRates(data.data || []))
      .catch((error) => console.error(error));
  }, []);

  const formik = useFormik({
    initialValues: {
      client_fullName: "",
      client_email: "",
      client_phoneNum: "",
      client_idNum: "",
      client_billAddress1: "",
      client_billAddress2: "",
      client_billCity: "",
      client_billZipcode: "",
      client_billState: "",
      client_billCountry: "Country",
      currency: fiatList[0]?.name || "",
      cryptocurrency: coinsList[0]?.name || "",
      fiat_amount: "",
      crypto_amount: "",
      client_affiliateId: query.get("affiliateId") || "",
      crypto_wallet: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const queryString = Object.entries(values)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      window.location.href = `https://digitalcoinranker.com/?${queryString}`;
    },
  });

  useEffect(() => {
    setAvailableCryptos(
      formik.values.client_billCountry === "Canada"
        ? [
            { id: 0, name: "BTC" },
            { id: 1, name: "ETH" },
          ]
        : coinsList
    );
  }, [formik.values.client_billCountry]);

  useEffect(() => {
    const { currency, cryptocurrency, fiat_amount } = formik.values;
    const currencyRate =
      rates.find((rate) => rate.symbol === currency)?.rateUsd || 1;
    const cryptoRate =
      rates.find((rate) => rate.symbol === cryptocurrency)?.rateUsd || 1;
    const percent = 0.05;
    const rateWithPercent = cryptoRate * (1 + percent);
    const newFiatAmountInUSD = fiat_amount * currencyRate;
    const newCryptoAmountInUSD = newFiatAmountInUSD / rateWithPercent;
    const newCryptoAmountValue = newCryptoAmountInUSD.toFixed(7);

    formik.setFieldValue("crypto_amount", newCryptoAmountValue);
    setCalculatedValues({
      fiatAmountInUSD: newFiatAmountInUSD,
      cryptoAmountInUSD: newCryptoAmountValue,
    });
  }, [
    formik.values.currency,
    formik.values.cryptocurrency,
    formik.values.fiat_amount,
    rates,
  ]);

  return (
    <Container maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <div className="title">
          <h2>Basic Information</h2>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_fullName"
              label="Full Name"
              fullWidth
              variant="outlined"
              value={formik.values.client_fullName}
              onChange={formik.handleChange}
              error={
                formik.touched.client_fullName &&
                Boolean(formik.errors.client_fullName)
              }
              helperText={
                formik.touched.client_fullName && formik.errors.client_fullName
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="client_email"
              label="Email"
              fullWidth
              variant="outlined"
              value={formik.values.client_email}
              onChange={formik.handleChange}
              error={
                formik.touched.client_email &&
                Boolean(formik.errors.client_email)
              }
              helperText={
                formik.touched.client_email && formik.errors.client_email
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_phoneNum"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={formik.values.client_phoneNum}
              onChange={formik.handleChange}
              error={
                formik.touched.client_phoneNum &&
                Boolean(formik.errors.client_phoneNum)
              }
              helperText={
                formik.touched.client_phoneNum && formik.errors.client_phoneNum
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_idNum"
              label="ID Number"
              fullWidth
              variant="outlined"
              value={formik.values.client_idNum}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>

        <div className="title">
          <h2>Address</h2>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <TextField
              name="client_billAddress1"
              label="Billing Address 1"
              fullWidth
              variant="outlined"
              value={formik.values.client_billAddress1}
              onChange={formik.handleChange}
              error={
                formik.touched.client_billAddress1 &&
                Boolean(formik.errors.client_billAddress1)
              }
              helperText={
                formik.touched.client_billAddress1 &&
                formik.errors.client_billAddress1
              }
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              name="client_billAddress2"
              label="Billing Address 2"
              fullWidth
              variant="outlined"
              value={formik.values.client_billAddress2}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_billCity"
              label="Billing City"
              fullWidth
              variant="outlined"
              value={formik.values.client_billCity}
              onChange={formik.handleChange}
              error={
                formik.touched.client_billAddress2 &&
                Boolean(formik.errors.client_billAddress2)
              }
              helperText={
                formik.touched.client_billAddress2 &&
                formik.errors.client_billAddress2
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_billZipcode"
              label="Billing Zipcode"
              fullWidth
              variant="outlined"
              value={formik.values.client_billZipcode}
              onChange={formik.handleChange}
              error={
                formik.touched.client_billZipcode &&
                Boolean(formik.errors.client_billZipcode)
              }
              helperText={
                formik.touched.client_billZipcode &&
                formik.errors.client_billZipcode
              }
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-autowidth-label">
                Billing Country
              </InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                fullWidth
                value={formik.values.client_billCountry}
                onChange={(e) => {
                  formik.setFieldValue("client_billCountry", e.target.value);
                }}
                error={
                  formik.touched.client_billCountry &&
                  Boolean(formik.errors.client_billCountry)
                }
                name="client_billCountry"
                label="Billing Country"
              >
                <MenuItem value="Country">Country</MenuItem>
                {countryList.map((country) => (
                  <MenuItem key={country.id} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_billState"
              label="Billing State"
              fullWidth
              variant="outlined"
              value={formik.values.client_billState}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>

        <div className="title">
          <h2>Transaction Details</h2>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-autowidth-label">
                Currency
              </InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                fullWidth
                value={formik.values.currency}
                onChange={(e) => {
                  formik.setFieldValue("currency", e.target.value);
                }}
                error={
                  formik.touched.currency && Boolean(formik.errors.currency)
                }
                name="currency"
                label="Currency"
              >
                {fiatList.map((fiat) => (
                  <MenuItem key={fiat.id} value={fiat.name}>
                    {fiat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="fiat_amount"
              label="Your amount"
              fullWidth
              variant="outlined"
              type="number"
              value={formik.values.fiat_amount}
              onChange={formik.handleChange}
              error={
                formik.touched.fiat_amount && Boolean(formik.errors.fiat_amount)
              }
              helperText={
                formik.touched.fiat_amount && formik.errors.fiat_amount
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-autowidth-label">
                Cryptocurrency
              </InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                fullWidth
                value={formik.values.cryptocurrency}
                onChange={(e) => {
                  formik.setFieldValue("cryptocurrency", e.target.value);
                }}
                error={
                  formik.touched.cryptocurrency &&
                  Boolean(formik.errors.cryptocurrency)
                }
                name="cryptocurrency"
                label="Cryptocurrency"
              >
                {availableCryptos.map((coin) => (
                  <MenuItem key={coin.id} value={coin.name}>
                    {coin.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="crypto_amount"
              label="Crypto amount"
              fullWidth
              variant="outlined"
              type="number"
              value={calculatedValues.cryptoAmountInUSD}
              disabled
              onChange={formik.handleChange}
              error={
                formik.touched.crypto_amount &&
                Boolean(formik.errors.crypto_amount)
              }
              helperText={
                formik.touched.crypto_amount && formik.errors.crypto_amount
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="client_affiliateId"
              label="Affiliate ID"
              fullWidth
              variant="outlined"
              value={formik.values.client_affiliateId}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="crypto_wallet"
              label="Crypto wallet"
              fullWidth
              variant="outlined"
              value={formik.values.crypto_wallet}
              onChange={formik.handleChange}
              error={
                formik.touched.crypto_wallet &&
                Boolean(formik.errors.crypto_wallet)
              }
              helperText={
                formik.touched.crypto_wallet && formik.errors.crypto_wallet
              }
            />
          </Grid>
        </Grid>
        <Button size="large" type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default FormComponent;

import * as Yup from "yup";

export const ArticleInfoSchema = Yup.object().shape({
  title_en: Yup.string().required("English title is required"),
  subtitle_en: Yup.string().required("English subtitle is required"),
  title_bn: Yup.string().required("Bangla title is required"),
  subtitle_bn: Yup.string().required("Bangla subtitle is required"),
  cover_img_link: Yup.string().url("Must be a valid URL").required("Cover image link is required"),
  cover_img_cap_en: Yup.string().required("Cover image caption (EN) is required"),
  cover_img_cap_bn: Yup.string().required("Cover image caption (BN) is required"),
  author_name: Yup.string().required("Author name is required"),
  author_img_link: Yup.string().url("Must be a valid URL").required("Author profile image link is required"),
  author_email: Yup.string().email("Invalid email").required("Author email is required"),
  // publish_author_email: Yup.boolean().oneOf([true], "You must confirm publishing author email"),
});
import React from "react";
import { ColorValue, TextProps } from "react-native";
import { SvgXml } from "react-native-svg";

const FILL_REPLACEMENT = "${FILL_REPLACEMENT}";

const iconStrings = {
  profile: `<svg width="800px" height="800px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>profile_round [#1342]</title>
  <desc>Created with Sketch.</desc>
  <defs>
</defs>
  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -2159.000000)" fill="${FILL_REPLACEMENT}">
          <g id="icons" transform="translate(56.000000, 160.000000)">
              <path d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598" id="profile_round-[#1342]">

</path>
          </g>
      </g>
  </g>
</svg>
    `,
};

export interface IconProps extends TextProps {
  /**
   * The height of the icon. Default is 32, unless props.width is specified, in which case, the
   * icon's intrinsic aspect ratio is used to determine it.
   */
  height?: number | undefined;
  /**
   * The width of the icon. Default is to use the icon's intrinsic aspect ratio based on
   * `props.height`.
   */
  width?: number | undefined;
  /**
   * The color to use for the icon. Default is `useColor().TEXT`.
   */
  color?: ColorValue | undefined;
  /**
   * The name of the icon to use. Must be one of the names in `iconStrings`.
   */
  children: string;
}

/**
 * A component used to display SVG icons (using the data above in `iconStrings`). The <Icon>'s only
 * children should be a plain string indicating the (case-insensitive) name of the icon to display
 * (e.g., <Icon>Home</Icon> to display the Home icon).
 *
 * To change the icon color, specify a "color" prop on the <Icon>. To change the icon's size, you
 * can specify a "height" and/or "width" prop (using just one will automatically scale it up and
 * keep the right aspect ratio). If neither a height nor width prop is specified, a height of 32 is
 * assumed.
 */
const Icon = ({
  height: passedHeight,
  width: passedWidth,
  color,
  children,
  ...props
}: IconProps) => {
  // Make sure the <Icon>'s only children is a string of text, and that it is a valid icon name.
  if (typeof children !== "string") {
    throw new Error(
      "<Icon> must have a string as its child (e.g., <Icon>Add</Icon>)."
    );
  } else if (!(children.toLowerCase() in iconStrings)) {
    throw new Error(`No icon with name "${children}".`);
  }
  // Get the specified icon name as a lowercase string.
  const iconName = children.toLowerCase() as keyof typeof iconStrings;
  // Ensure fillColor is a string. Default to 'black' if not.
  const fillColor = typeof color === "string" ? color : "black";

  // Get the height and width specified for the icon.
  let height: number | null = null;
  let width: number | null = null;
  // If the provided "height" prop is a number, set `height` to it.
  if (typeof passedHeight === "number") height = passedHeight;
  // Same for width.
  if (typeof passedWidth === "number") width = passedWidth;

  // If neither the height nor width props were numbers (i.e., not provided), assume a height of
  // 32.
  if (typeof height !== "number" && typeof width !== "number") height = 32;

  // If only one of height or width was provided, determine the other dimension by looking at the
  // <svg>s viewBox to determine its aspect ratio.
  if (typeof height !== "number" || typeof width !== "number") {
    // Get the viewBox from the <svg> naively using a regex.
    const match = iconStrings[iconName].match(
      /viewBox=(['"])\s*\S+\s+\S+\s+(\S+)\s+(\S+)\s*\1/
    );

    if (match) {
      // Determine the aspect ratio from the parsed out viewBox.
      const aspect_ratio = +match[2] / +match[3];
      // Calculate the missing dimension.
      height = typeof height === "number" ? height : width! / aspect_ratio;
      width = typeof width === "number" ? width : height * aspect_ratio;
    } else {
      // If we didn't find a match, the best we can do is hope for a 1:1 aspect ratio.
      height = typeof height === "number" ? height : width;
      width = typeof width === "number" ? width : height;
    }
  }

  // Now we can render the <svg> using an <SvgXml> from react-native-svg.
  return (
    <SvgXml
      xml={iconStrings[iconName].replaceAll(
        FILL_REPLACEMENT,
        fillColor || "black"
      )} // Use 'black' or any default color as a fallback
      preserveAspectRatio="xMidYMid meet"
      {...props}
      height={height as number}
      width={width as number}
    />
  );
};

export default Icon;

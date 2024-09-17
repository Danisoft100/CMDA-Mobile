import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";
import Button from "~/components/form/Button";
import { palette, typography } from "~/theme";

const OnboardingScreen = ({ navigation }: any) => {
  type SlideProps = {
    name: string;
    subtitle: string;
    image: any;
  };

  const SLIDES: SlideProps[] = [
    {
      name: "Welcome to Fuhrer!",
      subtitle:
        "Streamline bill payments with Fuhrer! Pay all your utilities - electricity, water, internet, and more - effortlessly in one place. Add your billers and never miss a payment again.",
      image: require("~/assets/images/onboarding-1.png"),
    },
    {
      name: "Quickly create your account",
      subtitle:
        "Sign up with Fuhrer in a snap! Just enter your info, verify your email, and you're ready to go. Join our community today and seize control of your finances.",
      image: require("~/assets/images/onboarding-2.png"),
    },
    {
      name: "Explore cryptocurrency with Fuhrer",
      subtitle:
        "Your gateway to seamless crypto trading! With our app, buying and selling cryptocurrencies has never been easier. Dive into the world of digital assets with confidence and convenience. Get started today",
      image: require("~/assets/images/onboarding-3.png"),
    },
    {
      name: "Quickly fund your Fuhrer wallet with cyrpto or Naira",
      subtitle:
        "Easily fund your Fuhrer wallet with crypto or Naira. With flexible funding options, you can top up your wallet in seconds. Whether you prefer using crypto assets or Naira.",
      image: require("~/assets/images/onboarding-4.png"),
    },
  ];

  const SliderComponent = ({ name, subtitle, image }: SlideProps) => (
    <View style={[styles.slide]}>
      <Text style={[typography.text3xl, typography.fontBold, { textAlign: "center" }]}>{name}</Text>
      <View style={styles.slideImageContainer}>
        <Image source={image} style={styles.slideImage} />
      </View>
      <Text style={[typography.textBase, typography.fontMedium, { textAlign: "center", marginBottom: 24 }]}>
        {subtitle}
      </Text>
      <Button label="Create new account" onPress={() => navigation.navigate("sign-up")} style={{ width: "100%" }} />
      <View style={{ flexDirection: "row" }}>
        <Text style={[typography.textBase, typography.fontMedium]}>Have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-in")}>
          <Text style={[typography.textBase, typography.fontMedium, { color: palette.primary }]}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <Swiper showsButtons={false} autoplay loop={false} autoplayTimeout={5}>
        {SLIDES.map((item) => (
          <SliderComponent key={item.name} name={item.name} subtitle={item.subtitle} image={item.image} />
        ))}
      </Swiper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: palette.background },
  slideContainer: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  slideImageContainer: {
    backgroundColor: palette.primaryLight,
    height: 240,
    width: 240,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  slideImage: { width: 180, height: 180 },
});

export default OnboardingScreen;
